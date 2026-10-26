import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Question, Answer, AnswerResult, QuizSession, Score } from '../types/api'
import { useAppContext } from '../contexts/AppContext'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { QuestionRenderer } from './QuestionRenderer'
import { ProgressIndicator } from './ProgressIndicator'
import { ResultsScreen } from './ResultsScreen'
import { QuizTimer } from './QuizTimer'
import RewardAnimation from './RewardAnimation'
import LoadingAnimation from './LoadingAnimation'
import TransitionWrapper from './TransitionWrapper'
import styles from './QuizInterface.module.css'

interface QuizInterfaceProps {
  session: QuizSession
  onQuizComplete: (score: Score, completedSession: QuizSession) => void
  onQuizExit: () => void
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  session,
  onQuizComplete,
  onQuizExit
}) => {
  const { state, dispatch } = useAppContext()
  const feedbackDuration = state.settings.feedbackDurationMs ?? 2000

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerResult[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(
    session.config.time_limit_seconds ? session.config.time_limit_seconds * 1000 : undefined
  )
  const [quizStartTime] = useState(Date.now())
  const [isQuizComplete, setIsQuizComplete] = useState(false)
  const finalScoreRef = useRef<Score | null>(null)
  const [finalScore, setFinalScore] = useState<Score | null>(null)

  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [rewardAnimationType, setRewardAnimationType] = useState<'success' | 'failure' | 'achievement' | 'streak'>('success')
  const quizContainerRef = useRef<HTMLDivElement>(null)

  // Use a ref to avoid stale closure bugs in the timer
  const isQuizCompleteRef = useRef(false)
  const showFeedbackRef = useRef(false)
  const currentQuestionRef = useRef<Question | null>(null)

  // Keep refs in sync with state
  useEffect(() => { isQuizCompleteRef.current = isQuizComplete }, [isQuizComplete])
  useEffect(() => { showFeedbackRef.current = showFeedback }, [showFeedback])
  useEffect(() => { currentQuestionRef.current = currentQuestion }, [currentQuestion])

  // Load current question
  useEffect(() => {
    if (session.questions && session.questions[currentQuestionIndex]) {
      setCurrentQuestion(session.questions[currentQuestionIndex])
    }
  }, [session.questions, currentQuestionIndex])

  // Minimal anti-cheat: only block developer tools shortcuts.
  // Clipboard (Ctrl+C/V/X/A), text selection, and drag are left ENABLED
  // because blocking them breaks accessibility tools and is harmful for kids.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && (e.key === 'p' || e.key === 'P'))
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Warn before leaving mid-quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isQuizCompleteRef.current && currentQuestionRef.current) {
        e.preventDefault()
        e.returnValue = 'Your quiz progress will be lost if you leave.'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Timer — uses refs to avoid stale closure
  useEffect(() => {
    if (timeRemaining === undefined || timeRemaining <= 0 || isQuizComplete) {
      return
    }

    const timer = setInterval(() => {
      if (isQuizCompleteRef.current) {
        clearInterval(timer)
        return
      }
      setTimeRemaining(prev => {
        if (prev === undefined || prev <= 1000) {
          // Fire time-up via ref values to avoid stale closures
          if (!isQuizCompleteRef.current && !showFeedbackRef.current) {
            handleAnswerSubmit('')
          }
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isQuizComplete])

  const handleAnswerSubmit = useCallback(async (answer: Answer) => {
    if (!currentQuestionRef.current || isSubmitting || showFeedbackRef.current || !session?.id) {
      return
    }

    setIsSubmitting(true)

    try {
      if (answer === null || answer === undefined) {
        throw new Error('Answer cannot be null or undefined')
      }
      if (!session.id || typeof session.id !== 'number') {
        throw new Error('Invalid session ID')
      }

      const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000)

      const submitPromise = tauriAPI.submitAnswer(session.id, answer, timeTaken)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Answer submission timeout')), 10000)
      )

      const result = await Promise.race([submitPromise, timeoutPromise]) as AnswerResult

      if (!result || typeof result.is_correct !== 'boolean') {
        throw new Error('Invalid answer result from backend')
      }

      setLastAnswerResult(result)

      // Capture length before state update to avoid stale closure
      setAnswers(prev => {
        const newAnswers = [...prev, result]
        const isLastQuestion = newAnswers.length >= session.questions.length

        setShowFeedback(true)
        showFeedbackRef.current = true

        try {
          setRewardAnimationType(result.is_correct ? 'success' : 'failure')
          setShowRewardAnimation(true)
        } catch { /* animation failure is non-critical */ }

        const delay = process.env.NODE_ENV === 'test' ? 10 : feedbackDuration
        setTimeout(() => {
          setShowRewardAnimation(false)
          if (isLastQuestion) {
            completeQuiz(newAnswers).catch(e => console.error('Quiz completion failed:', e))
          } else {
            moveToNextQuestion()
          }
        }, delay)

        return newAnswers
      })

    } catch (error) {
      console.error('Failed to submit answer:', error)

      const fallbackResult: AnswerResult = {
        question_id: currentQuestionRef.current?.id ?? 0,
        is_correct: false,
        points: 0,
        correct_answer: currentQuestionRef.current?.correct_answer ?? '',
        explanation: 'There was a problem checking your answer.',
        time_taken: Math.floor((Date.now() - quizStartTime) / 1000)
      }

      setLastAnswerResult(fallbackResult)
      setAnswers(prev => {
        const newAnswers = [...prev, fallbackResult]
        const isLastQuestion = newAnswers.length >= session.questions.length
        setShowFeedback(true)
        showFeedbackRef.current = true
        setRewardAnimationType('failure')
        setShowRewardAnimation(true)

        const delay = process.env.NODE_ENV === 'test' ? 10 : feedbackDuration
        setTimeout(() => {
          setShowRewardAnimation(false)
          if (isLastQuestion) {
            completeQuiz(newAnswers).catch(e => console.error('Quiz completion failed:', e))
          } else {
            moveToNextQuestion()
          }
        }, delay)

        return newAnswers
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, session, quizStartTime, feedbackDuration])

  const moveToNextQuestion = () => {
    if (!session?.questions) {
      completeQuiz().catch(e => console.error('Emergency quiz completion failed:', e))
      return
    }
    setShowFeedback(false)
    showFeedbackRef.current = false
    setLastAnswerResult(null)
    setCurrentQuestionIndex(prev => prev + 1)
  }

  const completeQuiz = async (finalAnswers?: AnswerResult[]) => {
    if (isQuizCompleteRef.current) return
    isQuizCompleteRef.current = true
    setIsQuizComplete(true)

    const answersToUse = finalAnswers ?? answers

    try {
      const updatedSession: QuizSession = {
        ...session,
        answers: answersToUse,
        completed_at: new Date().toISOString(),
        total_time_seconds: Math.floor((Date.now() - quizStartTime) / 1000)
      }

      const score = await tauriAPI.calculateScore(updatedSession)
      finalScoreRef.current = score
      setFinalScore(score)

      if (state.currentProfile?.id) {
        await tauriAPI.updateProgress(state.currentProfile.id, {
          subject: session.config.subject,
          key_stage: session.config.key_stage,
          questions_answered: session.questions.length,
          correct_answers: score.correct_answers,
          time_spent_seconds: updatedSession.total_time_seconds
        })
      }

      onQuizComplete(score, updatedSession)
    } catch (error) {
      console.error('Failed to complete quiz:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Could not save your quiz results. Please try again.' })
    }
  }

  // Quiz complete — show results screen using proper navigation (no reload)
  if (isQuizComplete && finalScore) {
    return (
      <ResultsScreen
        score={finalScore}
        session={session}
        onContinue={() => {
          dispatch({ type: 'SET_LAST_RESULT', payload: { score: finalScore, session } })
          dispatch({ type: 'SET_CURRENT_VIEW', payload: 'subjects' })
        }}
        onRestart={() => {
          dispatch({ type: 'SET_QUIZ_CONFIG', payload: session.config })
          dispatch({ type: 'SET_CURRENT_VIEW', payload: 'quiz' })
        }}
        onExit={onQuizExit}
      />
    )
  }

  if (!isQuizComplete && (!currentQuestion || !session?.questions)) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingAnimation type="quiz" size="large" message="Loading question..." />
      </div>
    )
  }

  if (!isQuizComplete && currentQuestionIndex >= session.questions.length) {
    completeQuiz().catch(e => console.error('Force completion failed:', e))
    return (
      <div className={styles.loadingContainer}>
        <LoadingAnimation type="quiz" size="large" message="Calculating your score..." />
      </div>
    )
  }

  if (!currentQuestion?.content?.text) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>😕</div>
        <p>Oops! There was a problem loading this question.</p>
        <button className={styles.errorButton} onClick={onQuizExit}>Go Back</button>
      </div>
    )
  }

  return (
    <div
      ref={quizContainerRef}
      className={`${styles.quizContainer} quiz-area`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Quiz Header */}
      <div className={styles.quizHeader}>
        <ProgressIndicator
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={session.questions.length}
          correctAnswers={answers.filter(a => a.is_correct).length}
        />

        {timeRemaining !== undefined && (
          <QuizTimer
            timeRemaining={timeRemaining}
            totalTime={session.config.time_limit_seconds! * 1000}
            onTimeUp={() => {
              if (!isQuizCompleteRef.current && !showFeedbackRef.current) {
                handleAnswerSubmit('')
              }
            }}
          />
        )}

        <button
          className={styles.exitButton}
          onClick={onQuizExit}
          aria-label="Exit quiz"
        >
          ✕
        </button>
      </div>

      {/* Question Content */}
      <div className={`${styles.questionSection} quiz-content`}>
        <TransitionWrapper type="slide" direction="left" duration={300} isVisible={!showFeedback}>
          <QuestionRenderer
            question={currentQuestion}
            onAnswer={handleAnswerSubmit}
            disabled={isSubmitting || showFeedback}
            showFeedback={showFeedback}
            isCorrect={lastAnswerResult?.is_correct}
            timeRemaining={timeRemaining}
          />
        </TransitionWrapper>
      </div>

      {/* Feedback Section */}
      {showFeedback && lastAnswerResult && (
        <TransitionWrapper type="bounce" duration={400} isVisible={showFeedback}>
          <div className={`${styles.feedbackSection} ${
            lastAnswerResult.is_correct ? styles.correctFeedback : styles.incorrectFeedback
          }`}>
            <div className={styles.feedbackContent}>
              <div className={styles.feedbackIcon}>
                {lastAnswerResult.is_correct ? '🎉' : '💪'}
              </div>
              <div className={styles.feedbackText}>
                {lastAnswerResult.is_correct ? 'Excellent!' : 'Keep going — you can do it!'}
              </div>
              {lastAnswerResult.explanation && (
                <div className={styles.explanation}>{lastAnswerResult.explanation}</div>
              )}
              <div className={styles.points}>+{lastAnswerResult.points} points</div>
            </div>
          </div>
        </TransitionWrapper>
      )}

      {/* Reward Animation */}
      <RewardAnimation
        type={rewardAnimationType}
        isVisible={showRewardAnimation}
        onComplete={() => setShowRewardAnimation(false)}
        size="large"
      />

      {/* Loading overlay during submission */}
      {isSubmitting && (
        <div className={styles.submissionOverlay}>
          <LoadingAnimation type="pulse" size="medium" message="Checking your answer..." />
        </div>
      )}
    </div>
  )
}

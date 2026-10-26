import React, { useState, useRef } from 'react'
import { Question, Answer } from '../types/api'
import styles from './MultipleChoiceQuestion.module.css'

interface MultipleChoiceQuestionProps {
  question: Question
  onAnswer: (answer: Answer) => void
  disabled?: boolean
  showFeedback?: boolean
  isCorrect?: boolean
}

/**
 * Normalise a `correct_answer` value to a plain string for comparison.
 *
 * The Rust backend serialises `Answer::Text(s)` as `{ Text: s }` when
 * sent over IPC. Some older seeder entries used a bare string. This
 * function handles both so option matching is always reliable.
 */
function normaliseAnswer(answer: Answer): string {
  if (typeof answer === 'string') return answer
  if (answer && typeof answer === 'object' && !Array.isArray(answer)) {
    const rec = answer as Record<string, unknown>
    if (typeof rec['Text'] === 'string') return rec['Text']
    // Fallback: join first string value found
    const first = Object.values(rec).find(v => typeof v === 'string')
    if (typeof first === 'string') return first
  }
  return String(answer)
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  isCorrect
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const options = question.content.options ?? []
  const correctAnswerText = normaliseAnswer(question.correct_answer)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleOptionClick = (option: string) => {
    if (disabled || showFeedback) return
    setSelectedOption(option)
    onAnswer(option)
  }

  // Arrow-key navigation between options
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (index + 1) % options.length
      optionRefs.current[next]?.focus()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (index - 1 + options.length) % options.length
      optionRefs.current[prev]?.focus()
    }
  }

  const getOptionClassName = (option: string) => {
    let className = styles.option
    if (selectedOption === option) className += ` ${styles.selected}`
    if (showFeedback) {
      if (option === correctAnswerText) {
        className += ` ${styles.correct}`
      } else if (selectedOption === option && !isCorrect) {
        className += ` ${styles.incorrect}`
      }
    }
    if (disabled || showFeedback) className += ` ${styles.disabled}`
    return className
  }

  return (
    <div className={`${styles.container} secure-question`}>
      <div className={`${styles.questionText} quiz-content`}>
        <h2>{question.content.text}</h2>
      </div>

      {question.content.image_url && (
        <div className={styles.imageContainer}>
          <img
            src={question.content.image_url}
            alt="Question illustration"
            className={`${styles.questionImage} secure-image interactive`}
            onContextMenu={e => e.preventDefault()}
          />
        </div>
      )}

      <div
        className={`${styles.optionsContainer} quiz-content`}
        role="group"
        aria-label="Answer options"
      >
        {options.map((option, index) => (
          <button
            key={index}
            ref={el => { optionRefs.current[index] = el }}
            className={getOptionClassName(option)}
            onClick={() => handleOptionClick(option)}
            onKeyDown={e => handleKeyDown(e, index)}
            disabled={disabled || showFeedback}
            type="button"
            aria-pressed={selectedOption === option}
          >
            <span className={styles.optionLetter}>
              {String.fromCharCode(65 + index)}
            </span>
            <span className={styles.optionText}>{option}</span>
          </button>
        ))}
      </div>

      {showFeedback && selectedOption && (
        <div className={styles.feedbackContainer}>
          <div className={isCorrect ? styles.correctFeedback : styles.incorrectFeedback}>
            {isCorrect ? (
              <>
                <span className={styles.feedbackIcon}>✓</span>
                <span>Correct! Well done!</span>
              </>
            ) : (
              <>
                <span className={styles.feedbackIcon}>✗</span>
                <span>Not quite — the answer was <strong>{correctAnswerText}</strong>.</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

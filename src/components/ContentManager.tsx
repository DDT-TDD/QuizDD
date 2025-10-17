import React, { useState, useEffect } from 'react'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { contentSeeder } from '../services/contentSeeder'
import { contentInitializer } from '../utils/contentInitializer'
import { Question, QuestionContent, KeyStage, QuestionType } from '../types/api'
import styles from './ContentManager.module.css'

interface ContentStats {
  total_questions: number
  total_subjects: number
  total_assets: number
  questions_by_subject: Record<string, number>
}

interface Subject {
  id?: number
  name: string
  display_name: string
  icon_path?: string
  color_scheme?: string
  description?: string
}

/**
 * Content Manager Component
 * 
 * Provides an interface for managing educational content including:
 * - Viewing content statistics
 * - Seeding initial content
 * - Managing subjects and questions
 * - Content verification and validation
 */
export const ContentManager: React.FC = () => {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  
  // Form state for adding questions
  const [newQuestion, setNewQuestion] = useState({
    subject: 'mathematics',
    keyStage: 'KS1' as 'KS1' | 'KS2',
    questionType: 'multiple_choice' as QuestionType,
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 2,
    tags: [] as string[]
  })

  // Load initial data
  useEffect(() => {
    loadContentData()
  }, [])

  const loadContentData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load content statistics
      const contentStats = await tauriAPI.getContentStatistics()
      setStats(contentStats)

      // Load subjects
      const subjectList = await tauriAPI.getSubjects()
      setSubjects(subjectList)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedContent = async () => {
    try {
      setIsSeeding(true)
      setError(null)

      // Check if content already exists
      const isSeeded = await contentSeeder.isContentSeeded()
      
      if (isSeeded) {
        const confirmReseed = window.confirm(
          'Content already exists in the database. Do you want to add more sample content? This will not delete existing content.'
        )
        if (!confirmReseed) {
          setIsSeeding(false)
          return
        }
      }

      // Seed content
      await contentSeeder.seedAllContent()
      
      // Reload data to show updated statistics
      await loadContentData()
      
      alert('Content seeding completed successfully!')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed content')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleInitializeContent = async () => {
    try {
      setIsSeeding(true)
      setError(null)

      await contentInitializer.forceReinitialize()
      await loadContentData()
      
      alert('Content initialization completed successfully!')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize content')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleAddCustomQuestion = async () => {
    try {
      setIsSeeding(true)
      setError(null)

      // Find subject ID
      const subject = subjects.find(s => s.name === newQuestion.subject)
      if (!subject || !subject.id) {
        throw new Error('Invalid subject selected')
      }

      // Validate form
      if (!newQuestion.questionText.trim()) {
        throw new Error('Question text is required')
      }

      if (newQuestion.questionType === 'multiple_choice') {
        const validOptions = newQuestion.options.filter(opt => opt.trim() !== '')
        if (validOptions.length < 2) {
          throw new Error('Multiple choice questions need at least 2 options')
        }
        if (!newQuestion.correctAnswer.trim()) {
          throw new Error('Correct answer is required')
        }
      }

      // Build question object
      const question: Question = {
        subject_id: subject.id,
        key_stage: newQuestion.keyStage as KeyStage,
        question_type: newQuestion.questionType,
        content: {
          text: newQuestion.questionText,
          options: newQuestion.questionType === 'multiple_choice' 
            ? newQuestion.options.filter(opt => opt.trim() !== '')
            : undefined,
          story: undefined,
          image_url: undefined,
          hotspots: undefined,
          blanks: undefined,
          additional_data: undefined,
        } as QuestionContent,
        correct_answer: newQuestion.correctAnswer,
        difficulty_level: newQuestion.difficulty,
        tags: newQuestion.tags.length > 0 ? newQuestion.tags : ['custom'],
      }

      // Add question via Tauri API
      await tauriAPI.addQuestion(question)
      
      alert('✅ Question added successfully!')
      
      // Reset form
      setNewQuestion({
        subject: 'mathematics',
        keyStage: 'KS1',
        questionType: 'multiple_choice',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        difficulty: 2,
        tags: []
      })
      
      // Reload stats
      await loadContentData()
      setShowAddQuestion(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question')
    } finally {
      setIsSeeding(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading content data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📚 Content Manager</h2>
        <p>Manage educational content and database seeding</p>
      </div>

      {error && (
        <div className={styles.error}>
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={loadContentData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Content Statistics */}
      {stats && (
        <div className={styles.statsSection}>
          <h3>📊 Content Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total_questions}</div>
              <div className={styles.statLabel}>Total Questions</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total_subjects}</div>
              <div className={styles.statLabel}>Subjects</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total_assets}</div>
              <div className={styles.statLabel}>Assets</div>
            </div>
          </div>

          {/* Questions by Subject */}
          <div className={styles.subjectStats}>
            <h4>Questions by Subject</h4>
            <div className={styles.subjectGrid}>
              {Object.entries(stats.questions_by_subject).map(([subject, count]) => (
                <div key={subject} className={styles.subjectCard}>
                  <div className={styles.subjectName}>
                    {subjects.find(s => s.name === subject)?.display_name || subject}
                  </div>
                  <div className={styles.subjectCount}>{count} questions</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subjects List */}
      {subjects.length > 0 && (
        <div className={styles.subjectsSection}>
          <h3>📖 Available Subjects</h3>
          <div className={styles.subjectsList}>
            {subjects.map((subject) => (
              <div key={subject.id} className={styles.subjectItem}>
                <div className={styles.subjectInfo}>
                  <h4>{subject.display_name}</h4>
                  <p>{subject.description || 'No description available'}</p>
                  <div className={styles.subjectMeta}>
                    <span>ID: {subject.id}</span>
                    <span>Name: {subject.name}</span>
                    {subject.color_scheme && (
                      <span 
                        className={styles.colorIndicator}
                        style={{ backgroundColor: subject.color_scheme }}
                      ></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actionsSection}>
        <h3>🔧 Content Actions</h3>
        <div className={styles.actionButtons}>
          <button
            onClick={handleSeedContent}
            disabled={isSeeding}
            className={styles.seedButton}
          >
            {isSeeding ? '🌱 Seeding...' : '🌱 Seed Content'}
          </button>
          
          <button
            onClick={handleInitializeContent}
            disabled={isSeeding}
            className={styles.initButton}
          >
            {isSeeding ? '🚀 Initializing...' : '🚀 Initialize Content'}
          </button>
          
          <button
            onClick={loadContentData}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            🔄 Refresh Data
          </button>
        </div>

        <div className={styles.actionDescriptions}>
          <div className={styles.actionDesc}>
            <strong>Seed Content:</strong> Add comprehensive educational questions to the database
          </div>
          <div className={styles.actionDesc}>
            <strong>Initialize Content:</strong> Force re-initialization of the content system
          </div>
          <div className={styles.actionDesc}>
            <strong>Refresh Data:</strong> Reload current content statistics and subjects
          </div>
        </div>
      </div>

      {/* Add Custom Question Section */}
      <div className={styles.addQuestionSection}>
        <h3>➕ Add Custom Question</h3>
        <button
          onClick={() => setShowAddQuestion(!showAddQuestion)}
          className={styles.toggleButton}
        >
          {showAddQuestion ? '▼ Hide Form' : '▶ Show Form'}
        </button>

        {showAddQuestion && (
          <div className={styles.questionForm}>
            <div className={styles.formRow}>
              <label>
                Subject:
                <select
                  value={newQuestion.subject}
                  onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})}
                  className={styles.formSelect}
                >
                  {subjects.map(s => (
                    <option key={s.name} value={s.name}>{s.display_name}</option>
                  ))}
                </select>
              </label>

              <label>
                Key Stage:
                <select
                  value={newQuestion.keyStage}
                  onChange={(e) => setNewQuestion({...newQuestion, keyStage: e.target.value as 'KS1' | 'KS2'})}
                  className={styles.formSelect}
                >
                  <option value="KS1">KS1 (Ages 5-7)</option>
                  <option value="KS2">KS2 (Ages 7-11)</option>
                </select>
              </label>
            </div>

            <div className={styles.formRow}>
              <label>
                Question Type:
                <select
                  value={newQuestion.questionType}
                  onChange={(e) => setNewQuestion({...newQuestion, questionType: e.target.value as QuestionType})}
                  className={styles.formSelect}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="fill_blank">Fill in the Blank</option>
                  <option value="story_quiz">Story Quiz</option>
                </select>
              </label>

              <label>
                Difficulty (1-5):
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({...newQuestion, difficulty: parseInt(e.target.value)})}
                  className={styles.formInput}
                />
              </label>
            </div>

            <div className={styles.formRow}>
              <label className={styles.fullWidth}>
                Question Text:
                <textarea
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                  placeholder="Enter your question here..."
                  className={styles.formTextarea}
                  rows={3}
                />
              </label>
            </div>

            {newQuestion.questionType === 'multiple_choice' && (
              <>
                <div className={styles.optionsSection}>
                  <h4>Answer Options:</h4>
                  {newQuestion.options.map((opt, idx) => (
                    <div key={idx} className={styles.optionRow}>
                      <span className={styles.optionLabel}>Option {idx + 1}:</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...newQuestion.options]
                          newOpts[idx] = e.target.value
                          setNewQuestion({...newQuestion, options: newOpts})
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className={styles.formInput}
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.formRow}>
                  <label className={styles.fullWidth}>
                    Correct Answer:
                    <input
                      type="text"
                      value={newQuestion.correctAnswer}
                      onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                      placeholder="Type the exact correct answer from the options above"
                      className={styles.formInput}
                    />
                  </label>
                </div>
              </>
            )}

            <div className={styles.formActions}>
              <button
                onClick={handleAddCustomQuestion}
                disabled={isSeeding || !newQuestion.questionText.trim()}
                className={styles.submitButton}
              >
                {isSeeding ? '⏳ Adding...' : '✅ Add Question'}
              </button>
              <button
                onClick={() => setShowAddQuestion(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Guidelines */}
      <div className={styles.guidelinesSection}>
        <h3>📋 Content Guidelines</h3>
        <div className={styles.guidelines}>
          <h4>Question Types Supported:</h4>
          <ul>
            <li><strong>Multiple Choice:</strong> Questions with 4 answer options</li>
            <li><strong>Fill in the Blank:</strong> Text input questions</li>
            <li><strong>Story Quiz:</strong> Reading comprehension with questions</li>
            <li><strong>Drag & Drop:</strong> Interactive matching exercises</li>
            <li><strong>Hotspot:</strong> Click on image areas</li>
          </ul>

          <h4>Subjects Covered:</h4>
          <ul>
            <li><strong>Mathematics:</strong> KS1 & KS2 arithmetic, shapes, measurements</li>
            <li><strong>Geography:</strong> Countries, capitals, flags, landmarks</li>
            <li><strong>English:</strong> Spelling, grammar, vocabulary, reading</li>
            <li><strong>Science:</strong> Plants, animals, human body, space</li>
            <li><strong>General Knowledge:</strong> History, culture, interesting facts</li>
          </ul>

          <h4>Key Stages:</h4>
          <ul>
            <li><strong>KS1:</strong> Ages 5-7 (Years 1-2)</li>
            <li><strong>KS2:</strong> Ages 7-11 (Years 3-6)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ContentManager
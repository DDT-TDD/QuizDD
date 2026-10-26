import React, { useState, useEffect, useRef } from 'react'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { contentSeeder } from '../services/contentSeeder'
import { contentInitializer } from '../utils/contentInitializer'
import { Question, QuestionContent, KeyStage, QuestionType, ContentPack } from '../types/api'
import { SimpleParentalGate } from './SimpleParentalGate'
import styles from './ContentManager.module.css'

interface ContentStats {
  total_questions: number
  total_subjects: number
  total_assets: number
  questions_by_subject: Record<string, number>
}

interface SubjectInfo {
  id?: number
  name: string
  display_name: string
  icon_path?: string
  color_scheme?: string
  description?: string
}

// ── Inline styled modal (replaces window.alert / window.confirm) ──────────────
interface ModalProps {
  type: 'info' | 'confirm'
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
}

const Modal: React.FC<ModalProps> = ({ type, title, message, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.5)', padding: '1rem'
  }}>
    <div style={{
      background: 'white', borderRadius: '1rem', padding: '2rem',
      maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#333' }}>
        <strong>{title}</strong><br />{message}
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {type === 'confirm' && onCancel && (
          <button onClick={onCancel} style={{
            padding: '0.6rem 1.4rem', borderRadius: '0.5rem',
            border: '2px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '1rem'
          }}>Cancel</button>
        )}
        <button onClick={onConfirm} style={{
          padding: '0.6rem 1.4rem', borderRadius: '0.5rem',
          border: 'none', background: 'var(--color-primary, #4f46e5)',
          color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: 700
        }}>
          {type === 'confirm' ? 'Continue' : 'OK'}
        </button>
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Content Manager Component
 *
 * Provides an interface for:
 * - Viewing content statistics
 * - Seeding / re-seeding built-in content
 * - Importing questions from a JSON Content Pack file
 * - Adding, editing, and deleting individual questions (parental gate)
 * - Viewing subjects and per-subject question counts
 */
export const ContentManager: React.FC = () => {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [subjects, setSubjects] = useState<SubjectInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [hasParentalAccess, setHasParentalAccess] = useState(false)
  const [showParentalGate, setShowParentalGate] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  // Inline modal state
  const [modal, setModal] = useState<ModalProps | null>(null)

  const showModal = (props: Omit<ModalProps, 'onConfirm' | 'onCancel'> & {
    onConfirm: () => void; onCancel?: () => void
  }) => setModal(props)
  const closeModal = () => setModal(null)

  // Form state for adding / editing questions
  const emptyForm = {
    subject: 'mathematics',
    keyStage: 'KS1' as 'KS1' | 'KS2',
    questionType: 'multiple_choice' as QuestionType,
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 2,
    tags: [] as string[],
  }
  const [newQuestion, setNewQuestion] = useState(emptyForm)

  // Verify token against backend on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = sessionStorage.getItem('parental_session_token')
        if (!token) return
        const valid = await tauriAPI.validateParentalFeatureAccess('content_management', token)
        if (valid) setHasParentalAccess(true)
        else sessionStorage.removeItem('parental_session_token')
      } catch (err) {
        console.warn('ContentManager: token verification failed', err)
        sessionStorage.removeItem('parental_session_token')
      }
    }
    verifyToken()
  }, [])

  useEffect(() => { loadContentData() }, [])

  useEffect(() => {
    if (!hasParentalAccess && showAddQuestion) setShowAddQuestion(false)
  }, [hasParentalAccess, showAddQuestion])

  const loadContentData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [contentStats, subjectList] = await Promise.all([
        tauriAPI.getContentStatistics(),
        tauriAPI.getSubjects(),
      ])
      setStats(contentStats)
      setSubjects(subjectList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedContent = () => {
    const doSeed = async () => {
      closeModal()
      try {
        setIsSeeding(true)
        setError(null)
        await contentSeeder.seedAllContent()
        await loadContentData()
        showModal({ type: 'info', title: '✅ Done', message: 'Content seeded successfully!', onConfirm: closeModal })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to seed content')
      } finally {
        setIsSeeding(false)
      }
    }

    contentSeeder.isContentSeeded().then(isSeeded => {
      if (isSeeded) {
        showModal({
          type: 'confirm',
          title: 'Content already exists',
          message: 'Would you like to add more built-in content? Existing questions will not be removed.',
          onConfirm: doSeed,
          onCancel: closeModal,
        })
      } else {
        doSeed()
      }
    }).catch(doSeed)
  }

  const handleInitializeContent = async () => {
    try {
      setIsSeeding(true)
      setError(null)
      await contentInitializer.forceReinitialize()
      await loadContentData()
      showModal({ type: 'info', title: '✅ Done', message: 'Content initialised successfully!', onConfirm: closeModal })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialise content')
    } finally {
      setIsSeeding(false)
    }
  }

  // ── JSON Content Pack Import ──────────────────────────────────────────────
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!hasParentalAccess) {
      setShowParentalGate(true)
      return
    }

    try {
      setIsSeeding(true)
      setError(null)
      setImportResult(null)

      const text = await file.text()
      let pack: ContentPack
      try {
        pack = JSON.parse(text) as ContentPack
      } catch {
        throw new Error('Invalid JSON file — please check the format and try again.')
      }

      // Basic client-side validation
      if (!pack.questions || !Array.isArray(pack.questions)) {
        throw new Error('Content pack must have a "questions" array.')
      }
      if (!pack.version || !pack.name) {
        throw new Error('Content pack must have "version" and "name" fields.')
      }

      const result = await tauriAPI.importContentPack(pack)
      setImportResult(result)
      await loadContentData()

      if (result.errors.length > 0) {
        setError(`Import completed with ${result.errors.length} error(s). See details below.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import content pack')
    } finally {
      setIsSeeding(false)
      // Reset file input so the same file can be re-imported if needed
      if (importFileRef.current) importFileRef.current.value = ''
    }
  }

  // ── Parental access ───────────────────────────────────────────────────────
  const handleParentalSuccess = async () => {
    try {
      const token = await tauriAPI.generateParentalSessionToken()
      sessionStorage.setItem('parental_session_token', token)
    } catch (err) {
      console.error('ContentManager: failed to generate parental session token', err)
    } finally {
      setHasParentalAccess(true)
      setShowParentalGate(false)
      setShowAddQuestion(true)
    }
  }

  const handleParentalCancel = () => setShowParentalGate(false)

  const toggleAddQuestion = () => {
    if (!hasParentalAccess) { setShowParentalGate(true); return }
    setShowAddQuestion(prev => !prev)
  }

  // ── Add / edit question ───────────────────────────────────────────────────
  const handleAddCustomQuestion = async () => {
    if (!hasParentalAccess) {
      setError('Parental access required to add custom questions')
      return
    }
    try {
      setIsSeeding(true)
      setError(null)

      const subject = subjects.find(s => s.name === newQuestion.subject)
      if (!subject?.id) throw new Error('Invalid subject selected')
      if (!newQuestion.questionText.trim()) throw new Error('Question text is required')

      if (newQuestion.questionType === 'multiple_choice') {
        const validOptions = newQuestion.options.filter(o => o.trim())
        if (validOptions.length < 2) throw new Error('At least 2 answer options are required')
        if (!newQuestion.correctAnswer.trim()) throw new Error('Correct answer is required')
        if (!validOptions.includes(newQuestion.correctAnswer.trim())) {
          throw new Error('The correct answer must exactly match one of the options above')
        }
      }

      const question: Question = {
        subject_id: subject.id,
        key_stage: newQuestion.keyStage as KeyStage,
        question_type: newQuestion.questionType,
        content: {
          text: newQuestion.questionText.trim(),
          options: newQuestion.questionType === 'multiple_choice'
            ? newQuestion.options.filter(o => o.trim())
            : undefined,
        } as QuestionContent,
        correct_answer: newQuestion.correctAnswer.trim(),
        difficulty_level: newQuestion.difficulty,
        tags: newQuestion.tags.length ? newQuestion.tags : ['custom'],
      }

      await tauriAPI.addQuestion(question)
      setNewQuestion(emptyForm)
      setShowAddQuestion(false)
      await loadContentData()
      showModal({ type: 'info', title: '✅ Added', message: 'Your question was added successfully!', onConfirm: closeModal })
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
      {modal && <Modal {...modal} />}

      <div className={styles.header}>
        <h2>📚 Content Manager</h2>
        <p>Manage educational content and database seeding</p>
      </div>

      {error && (
        <div className={styles.error}>
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)} className={styles.retryButton}>Dismiss</button>
        </div>
      )}

      {/* Import result banner */}
      {importResult && (
        <div className={styles.statsSection} style={{ background: importResult.errors.length ? '#fff3cd' : '#d4edda', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
          <strong>📦 Import complete:</strong>{' '}
          {importResult.imported} question{importResult.imported !== 1 ? 's' : ''} imported,{' '}
          {importResult.skipped} skipped.
          {importResult.errors.length > 0 && (
            <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#856404' }}>
              {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          <button onClick={() => setImportResult(null)} style={{ marginTop: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>Dismiss</button>
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

          <div className={styles.subjectStats}>
            <h4>Questions by Subject</h4>
            <div className={styles.subjectGrid}>
              {Object.entries(stats.questions_by_subject).map(([subject, count]) => (
                <div key={subject} className={styles.subjectCard}>
                  <div className={styles.subjectName}>
                    {subjects.find(s => s.name === subject)?.display_name ?? subject}
                  </div>
                  <div className={styles.subjectCount}>{count} questions</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subjects list */}
      {subjects.length > 0 && (
        <div className={styles.subjectsSection}>
          <h3>📖 Available Subjects</h3>
          <div className={styles.subjectsList}>
            {subjects.map(subject => (
              <div key={subject.id} className={styles.subjectItem}>
                <div className={styles.subjectInfo}>
                  <h4>{subject.display_name}</h4>
                  <p>{subject.description ?? 'No description available'}</p>
                  <div className={styles.subjectMeta}>
                    <span>ID: {subject.id}</span>
                    <span>Name: {subject.name}</span>
                    {subject.color_scheme && (
                      <span className={styles.colorLabel}>Color: {subject.color_scheme}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Actions */}
      <div className={styles.actionsSection}>
        <h3>🔧 Content Actions</h3>
        <div className={styles.actionButtons}>
          <button onClick={handleSeedContent} disabled={isSeeding} className={styles.seedButton}>
            {isSeeding ? '🌱 Seeding…' : '🌱 Seed Built-in Content'}
          </button>
          <button onClick={handleInitializeContent} disabled={isSeeding} className={styles.initButton}>
            {isSeeding ? '🚀 Initialising…' : '🚀 Re-initialise Content'}
          </button>
          <button onClick={loadContentData} disabled={isLoading} className={styles.refreshButton}>
            🔄 Refresh Data
          </button>
        </div>
        <div className={styles.actionDescriptions}>
          <div className={styles.actionDesc}>
            <strong>Seed Built-in Content:</strong> Add the bundled educational questions to the database.
          </div>
          <div className={styles.actionDesc}>
            <strong>Re-initialise:</strong> Force a full reset and re-seed of all built-in content.
          </div>
        </div>
      </div>

      {/* JSON Content Pack Import */}
      <div className={styles.addQuestionSection}>
        <h3>📦 Import Content Pack (JSON)</h3>

        {!hasParentalAccess ? (
          <div className={styles.parentalNotice}>
            <p>Content import is protected. Unlock parent mode to import a question pack.</p>
            <button onClick={() => setShowParentalGate(true)} className={styles.parentalNoticeButton}>
              🔒 Unlock Parent Mode
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.75rem' }}>
              Select a <code>.json</code> Content Pack file to bulk-import questions.
              See <em>Content Pack Format</em> guide below for the expected schema.
            </p>
            <label className={styles.importLabel}>
              <input
                ref={importFileRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                disabled={isSeeding}
                className={styles.importInput}
              />
              <span className={`${styles.importButton} ${isSeeding ? styles.importButtonDisabled : ''}`}>
                {isSeeding ? '⏳ Importing…' : '📂 Choose JSON File'}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Add Custom Question */}
      <div className={styles.addQuestionSection}>
        <h3>➕ Add Single Question</h3>
        <button onClick={toggleAddQuestion} className={styles.toggleButton}>
          {showAddQuestion && hasParentalAccess ? '▼ Hide Form' : '▶ Show Form'}
        </button>

        {!hasParentalAccess && (
          <div className={styles.parentalNotice}>
            <p>Manual content tools are protected. Enable parent mode to add custom questions.</p>
            <button onClick={() => setShowParentalGate(true)} className={styles.parentalNoticeButton}>
              🔒 Unlock Parent Mode
            </button>
          </div>
        )}

        {showParentalGate && (
          <SimpleParentalGate
            onSuccess={handleParentalSuccess}
            onCancel={handleParentalCancel}
            title="Parent Access Required"
            message="Solve the challenge to unlock content management."
          />
        )}

        {showAddQuestion && hasParentalAccess && (
          <div className={styles.questionForm}>
            <div className={styles.formRow}>
              <label>
                Subject:
                <select
                  value={newQuestion.subject}
                  onChange={e => setNewQuestion({ ...newQuestion, subject: e.target.value })}
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
                  onChange={e => setNewQuestion({ ...newQuestion, keyStage: e.target.value as 'KS1' | 'KS2' })}
                  className={styles.formSelect}
                >
                  <option value="KS1">KS1 (Ages 5–7)</option>
                  <option value="KS2">KS2 (Ages 7–11)</option>
                </select>
              </label>
            </div>

            <div className={styles.formRow}>
              <label>
                Question Type:
                <select
                  value={newQuestion.questionType}
                  onChange={e => setNewQuestion({ ...newQuestion, questionType: e.target.value as QuestionType })}
                  className={styles.formSelect}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="fill_blank">Fill in the Blank</option>
                  <option value="story_quiz">Story Quiz</option>
                </select>
              </label>

              <label>
                Difficulty (1–5):
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newQuestion.difficulty}
                  onChange={e => setNewQuestion({ ...newQuestion, difficulty: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) })}
                  className={styles.formInput}
                />
              </label>
            </div>

            <div className={styles.formRow}>
              <label className={styles.fullWidth}>
                Question Text:
                <textarea
                  value={newQuestion.questionText}
                  onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  placeholder="Enter your question here…"
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
                      <span className={styles.optionLabel}>
                        {String.fromCharCode(65 + idx)}:
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOpts = [...newQuestion.options]
                          newOpts[idx] = e.target.value
                          setNewQuestion({ ...newQuestion, options: newOpts })
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className={styles.formInput}
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.formRow}>
                  <label className={styles.fullWidth}>
                    Correct Answer (must match an option exactly):
                    <select
                      value={newQuestion.correctAnswer}
                      onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                      className={styles.formSelect}
                    >
                      <option value="">— select —</option>
                      {newQuestion.options.filter(o => o.trim()).map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
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
                {isSeeding ? '⏳ Adding…' : '✅ Add Question'}
              </button>
              <button onClick={() => setShowAddQuestion(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Pack Format guide */}
      <div className={styles.guidelinesSection}>
        <h3>📋 Content Pack Format</h3>
        <div className={styles.guidelines}>
          <p>To bulk-import questions, create a <code>.json</code> file with this structure:</p>
          <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.8rem', overflowX: 'auto' }}>
{`{
  "version": "1.0",
  "name": "My Extra Questions",
  "description": "Optional description",
  "subjects": [],
  "questions": [
    {
      "subject_name": "mathematics",
      "key_stage": "KS1",
      "question_type": "multiple_choice",
      "content": {
        "text": "What is 3 + 4?",
        "options": ["5", "6", "7", "8"]
      },
      "correct_answer": "7",
      "difficulty_level": 1,
      "tags": ["addition"]
    }
  ]
}`}
          </pre>
          <h4>Supported question types:</h4>
          <ul>
            <li><strong>multiple_choice</strong> — include <code>options</code> array and a matching <code>correct_answer</code> string</li>
            <li><strong>fill_blank</strong> — include <code>blanks</code> array in <code>content</code></li>
            <li><strong>story_quiz</strong> — include <code>story</code> text in <code>content</code></li>
          </ul>
          <h4>Subjects (use the <code>name</code> field):</h4>
          <ul>
            {subjects.map(s => <li key={s.name}><code>{s.name}</code> — {s.display_name}</li>)}
          </ul>
          <h4>Key Stages:</h4>
          <ul>
            <li><strong>KS1</strong> — Ages 5–7 (Years 1–2)</li>
            <li><strong>KS2</strong> — Ages 7–11 (Years 3–6)</li>
          </ul>
          <h4>Difficulty (1–5):</h4>
          <ul>
            <li>1 = Beginner, 2 = Easy, 3 = Medium, 4 = Hard, 5 = Expert</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ContentManager

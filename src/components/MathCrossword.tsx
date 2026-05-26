import React, { useState, useEffect } from 'react'
import { generateMathCrossword, MathCrosswordPuzzle } from '../utils/puzzleGenerator'
import styles from './MathCrossword.module.css'
import parentStyles from './PuzzlesView.module.css'

interface MathCrosswordProps {
  onBack: () => void
}

export const MathCrossword: React.FC<MathCrosswordProps> = ({ onBack }) => {
  const [keyStage, setKeyStage] = useState<'KS1' | 'KS2'>('KS1')
  const [puzzle, setPuzzle] = useState<MathCrosswordPuzzle | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | 'none'>>({})

  // Generate a new puzzle when Key Stage changes
  const startNewPuzzle = (ks: 'KS1' | 'KS2') => {
    const newPuzzle = generateMathCrossword(ks)
    setPuzzle(newPuzzle)
    setSelectedCell(null)
    setIsCompleted(false)
    setFeedback({})

    // Initialize blank answers for all inputs
    const initialAnswers: Record<string, string> = {}
    const initialFeedback: Record<string, 'correct' | 'wrong' | 'none'> = {}
    
    // Find the first input to select automatically
    let firstInput: { r: number; c: number } | null = null

    for (let r = 0; r < newPuzzle.grid.length; r++) {
      for (let c = 0; c < newPuzzle.grid[r].length; c++) {
        const cell = newPuzzle.grid[r][c]
        if (cell.isInput && cell.inputId) {
          initialAnswers[cell.inputId] = ''
          initialFeedback[cell.inputId] = 'none'
          if (!firstInput) {
            firstInput = { r, c }
          }
        }
      }
    }

    setAnswers(initialAnswers)
    setFeedback(initialFeedback)
    if (firstInput) {
      setSelectedCell(firstInput)
    }
  }

  useEffect(() => {
    startNewPuzzle(keyStage)
  }, [keyStage])

  if (!puzzle) return null

  const handleCellClick = (r: number, c: number) => {
    const cell = puzzle.grid[r][c]
    if (cell.isInput) {
      setSelectedCell({ r, c })
    }
  }

  const handleKeyPress = (char: string) => {
    if (!selectedCell || isCompleted) return

    const cell = puzzle.grid[selectedCell.r][selectedCell.c]
    if (!cell.isInput || !cell.inputId) return

    const inputId = cell.inputId
    const newAnswers = { ...answers, [inputId]: char }
    setAnswers(newAnswers)

    // Inline validation for the current cell
    const isCorrect = char === cell.correctDigit
    const newFeedback = { 
      ...feedback, 
      [inputId]: isCorrect ? ('correct' as const) : ('wrong' as const) 
    }
    setFeedback(newFeedback)

    // Check if the overall puzzle is completely and correctly solved
    let allCorrect = true
    for (let r = 0; r < puzzle.grid.length; r++) {
      for (let c = 0; c < puzzle.grid[r].length; c++) {
        const gridCell = puzzle.grid[r][c]
        if (gridCell.isInput && gridCell.inputId) {
          const val = gridCell.inputId === inputId ? char : answers[gridCell.inputId]
          if (val !== gridCell.correctDigit) {
            allCorrect = false
            break
          }
        }
      }
      if (!allCorrect) break
    }

    if (allCorrect) {
      setIsCompleted(true)
      setSelectedCell(null)
    } else if (isCorrect) {
      // Find the next blank/empty input cell to move focus automatically
      moveToNextInput(selectedCell.r, selectedCell.c)
    }
  }

  const handleBackspace = () => {
    if (!selectedCell || isCompleted) return

    const cell = puzzle.grid[selectedCell.r][selectedCell.c]
    if (!cell.isInput || !cell.inputId) return

    const inputId = cell.inputId
    setAnswers({ ...answers, [inputId]: '' })
    setFeedback({ ...feedback, [inputId]: 'none' })
  }

  const moveToNextInput = (currR: number, currC: number) => {
    let inputsList: { r: number; c: number }[] = []
    let currIdx = -1

    for (let r = 0; r < puzzle.grid.length; r++) {
      for (let c = 0; c < puzzle.grid[r].length; c++) {
        const cell = puzzle.grid[r][c]
        if (cell.isInput) {
          inputsList.push({ r, c })
          if (r === currR && c === currC) {
            currIdx = inputsList.length - 1
          }
        }
      }
    }

    // Move to next cell in list if exists
    if (currIdx !== -1 && currIdx < inputsList.length - 1) {
      setSelectedCell(inputsList[currIdx + 1])
    }
  }

  // Get active cell inputId if any
  const activeInputId = selectedCell ? puzzle.grid[selectedCell.r][selectedCell.c].inputId : null

  // Determine keyboard configuration based on active cell type (operator vs digit)
  const isOperatorCellActive = activeInputId === 'eq2_op'

  return (
    <div className={styles.container}>
      <button className={parentStyles.backButton} onClick={onBack}>
        ⬅️ Back to Menu
      </button>

      <div className={styles.header}>
        <h1>➕ Math Crosswords</h1>
        <p>Fill in the blank numbers and signs so both crossing equations make sense! 🧠</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.difficultySelector}>
          <button
            className={`${styles.diffButton} ${keyStage === 'KS1' ? styles.diffButtonActive : ''}`}
            onClick={() => setKeyStage('KS1')}
          >
            Key Stage 1 (Ages 5-7) 🌟
          </button>
          <button
            className={`${styles.diffButton} ${keyStage === 'KS2' ? styles.diffButtonActive : ''}`}
            onClick={() => setKeyStage('KS2')}
          >
            Key Stage 2 (Ages 7-11) ⭐
          </button>
        </div>

        <button className={styles.resetButton} onClick={() => startNewPuzzle(keyStage)}>
          🔄 New Grid
        </button>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {puzzle.grid.map((row, r) =>
            row.map((cell, c) => {
              if (cell.isBlocked) {
                return <div key={`cell-${r}-${c}`} className={styles.cellBlocked} />
              }

              if (cell.isInput && cell.inputId) {
                const isSelected = selectedCell?.r === r && selectedCell?.c === c
                const val = answers[cell.inputId] || ''
                const cellStatus = feedback[cell.inputId] || 'none'

                let cellClass = `${styles.cell} ${styles.cellInput}`
                if (isSelected) cellClass += ` ${styles.cellActive}`
                if (cellStatus === 'correct') cellClass += ` ${styles.cellCorrect}`
                if (cellStatus === 'wrong') cellClass += ` ${styles.cellWrong}`

                return (
                  <button
                    key={`cell-${r}-${c}`}
                    className={cellClass}
                    onClick={() => handleCellClick(r, c)}
                    aria-label={`Row ${r} Column ${c} input. Enter digit.`}
                  >
                    {val}
                  </button>
                )
              }

              // Normal static character cell
              return (
                <div key={`cell-${r}-${c}`} className={`${styles.cell} ${styles.cellNormal}`}>
                  {cell.value}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* On-screen virtual dialpad for touch/tablet engagement */}
      {!isCompleted && selectedCell && (
        <div className={styles.keyboard}>
          <div className={styles.keyboardTitle}>Tap keys to enter values:</div>
          
          {isOperatorCellActive ? (
            <div className={styles.keyboardRow}>
              {['+', '-', '×', '÷'].map((op) => (
                <button
                  key={op}
                  className={styles.key}
                  onClick={() => handleKeyPress(op)}
                  disabled={keyStage === 'KS1' && (op === '×' || op === '÷')}
                >
                  {op}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className={styles.keyboardRow}>
                {['1', '2', '3', '4', '5'].map((num) => (
                  <button key={num} className={styles.key} onClick={() => handleKeyPress(num)}>
                    {num}
                  </button>
                ))}
              </div>
              <div className={styles.keyboardRow}>
                {['6', '7', '8', '9', '0'].map((num) => (
                  <button key={num} className={styles.key} onClick={() => handleKeyPress(num)}>
                    {num}
                  </button>
                ))}
              </div>
              <div className={styles.keyboardRow}>
                <button
                  className={`${styles.key} ${styles.keyboardDelete}`}
                  style={{ maxWidth: '100px' }}
                  onClick={handleBackspace}
                >
                  Clear ⌫
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Playful success congratulations screen */}
      {isCompleted && (
        <div className={styles.celebrationOverlay}>
          <div className={styles.celebrationCard}>
            <span className={styles.celebrationEmoji}>🎉🏆🌟</span>
            <h2>Super Math Master!</h2>
            <p>You solved the math crossword perfectly! Keep up the brilliant thinking! 🌟</p>
            <button className={styles.nextButton} onClick={() => startNewPuzzle(keyStage)}>
              Play Again 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

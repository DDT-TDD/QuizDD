import React, { useState, useEffect } from 'react'
import { generateWordCrossword, WordCrosswordPuzzle, WORD_CATEGORIES } from '../utils/puzzleGenerator'
import styles from './WordCrossword.module.css'
import parentStyles from './PuzzlesView.module.css'

interface WordCrosswordProps {
  onBack: () => void
}

type CategoryKey = 'animals' | 'science' | 'geography' | 'spelling'

export const WordCrossword: React.FC<WordCrosswordProps> = ({ onBack }) => {
  const [category, setCategory] = useState<CategoryKey>('animals')
  const [puzzle, setPuzzle] = useState<WordCrosswordPuzzle | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | 'none'>>({})

  const startNewPuzzle = (cat: CategoryKey) => {
    const newPuzzle = generateWordCrossword(cat)
    setPuzzle(newPuzzle)
    setSelectedCell(null)
    setIsCompleted(false)
    setFeedback({})

    // Initialize blank answers
    const initialAnswers: Record<string, string> = {}
    const initialFeedback: Record<string, 'correct' | 'wrong' | 'none'> = {}
    let firstInput: { r: number; c: number } | null = null

    for (let r = 0; r < newPuzzle.grid.length; r++) {
      for (let c = 0; c < newPuzzle.grid[r].length; c++) {
        const cell = newPuzzle.grid[r][c]
        if (cell.isInput) {
          const key = `${r}_${c}`
          initialAnswers[key] = ''
          initialFeedback[key] = 'none'
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
    startNewPuzzle(category)
  }, [category])

  if (!puzzle) return null

  const handleCellClick = (r: number, c: number) => {
    const cell = puzzle.grid[r][c]
    if (cell.isInput) {
      setSelectedCell({ r, c })
    }
  }

  const handleKeyPress = (char: string) => {
    if (!selectedCell || isCompleted) return

    const key = `${selectedCell.r}_${selectedCell.c}`
    const cell = puzzle.grid[selectedCell.r][selectedCell.c]
    if (!cell.isInput) return

    const newAnswers = { ...answers, [key]: char }
    setAnswers(newAnswers)

    const isCorrect = char === cell.letter
    const newFeedback = {
      ...feedback,
      [key]: isCorrect ? ('correct' as const) : ('wrong' as const)
    }
    setFeedback(newFeedback)

    // Check if the entire crossword is completely and correctly solved
    let allCorrect = true
    for (let r = 0; r < puzzle.grid.length; r++) {
      for (let c = 0; c < puzzle.grid[r].length; c++) {
        const gridCell = puzzle.grid[r][c]
        if (gridCell.isInput) {
          const cellKey = `${r}_${c}`
          const val = cellKey === key ? char : answers[cellKey]
          if (val !== gridCell.letter) {
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
      // Find and select the next blank cell in the current active word
      moveToNextCell(selectedCell.r, selectedCell.c, cell.wordIds[0])
    }
  }

  const handleBackspace = () => {
    if (!selectedCell || isCompleted) return
    const key = `${selectedCell.r}_${selectedCell.c}`
    setAnswers({ ...answers, [key]: '' })
    setFeedback({ ...feedback, [key]: 'none' })
  }

  const moveToNextCell = (currR: number, currC: number, wordId: string) => {
    // Find all cells that belong to this wordId
    const wordCells: { r: number; c: number }[] = []
    for (let r = 0; r < puzzle.grid.length; r++) {
      for (let c = 0; c < puzzle.grid[r].length; c++) {
        const cell = puzzle.grid[r][c]
        if (cell.isInput && cell.wordIds.includes(wordId)) {
          wordCells.push({ r, c })
        }
      }
    }

    // Sort cells chronologically depending on direction
    // If horizontal, sort by column; if vertical, sort by row.
    const placedWord = puzzle.placedWords.find(w => w.word === wordId)
    if (placedWord) {
      if (placedWord.direction === 'horizontal') {
        wordCells.sort((a, b) => a.c - b.c)
      } else {
        wordCells.sort((a, b) => a.r - b.r)
      }
    }

    const currIdx = wordCells.findIndex(cell => cell.r === currR && cell.c === currC)
    if (currIdx !== -1 && currIdx < wordCells.length - 1) {
      setSelectedCell(wordCells[currIdx + 1])
    } else {
      // Move to any other empty cell on the board
      let nextEmpty: { r: number; c: number } | null = null
      for (let r = 0; r < puzzle.grid.length; r++) {
        for (let c = 0; c < puzzle.grid[r].length; c++) {
          const cell = puzzle.grid[r][c]
          if (cell.isInput && !answers[`${r}_${c}`]) {
            nextEmpty = { r, c }
            break
          }
        }
        if (nextEmpty) break
      }
      if (nextEmpty) {
        setSelectedCell(nextEmpty)
      }
    }
  }

  // Get active word ID to highlight clues
  const activeWordId = selectedCell ? puzzle.grid[selectedCell.r][selectedCell.c].wordIds[0] : null

  const acrossClues = puzzle.placedWords.filter((w) => w.direction === 'horizontal')
  const downClues = puzzle.placedWords.filter((w) => w.direction === 'vertical')

  return (
    <div className={styles.container}>
      <button className={parentStyles.backButton} onClick={onBack}>
        ⬅️ Back to Menu
      </button>

      <div className={styles.header}>
        <h1>🔠 Spelling Crosswords</h1>
        <p>Solve the clues to fill in the crossword grid with correct vocabulary! ✏️</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.categorySelector}>
          {(Object.keys(WORD_CATEGORIES) as CategoryKey[]).map((cat) => (
            <button
              key={cat}
              className={`${styles.catButton} ${category === cat ? styles.catButtonActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              {WORD_CATEGORIES[cat].name.split(' ')[0]} {WORD_CATEGORIES[cat].name.split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>

        <button className={styles.resetButton} onClick={() => startNewPuzzle(category)}>
          🔄 New Grid
        </button>
      </div>

      <div className={styles.gameLayout}>
        <div className={styles.gridContainer}>
          <div className={styles.grid}>
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                if (cell.isBlocked) {
                  return <div key={`cell-${r}-${c}`} className={styles.cellBlocked} />
                }

                const isSelected = selectedCell?.r === r && selectedCell?.c === c
                const cellKey = `${r}_${c}`
                const val = answers[cellKey] || ''
                const cellStatus = feedback[cellKey] || 'none'

                let cellClass = `${styles.cell} ${styles.cellInput}`
                if (isSelected) cellClass += ` ${styles.cellActive}`
                if (cellStatus === 'correct') cellClass += ` ${styles.cellCorrect}`
                if (cellStatus === 'wrong') cellClass += ` ${styles.cellWrong}`

                return (
                  <button
                    key={`cell-${r}-${c}`}
                    className={cellClass}
                    onClick={() => handleCellClick(r, c)}
                    aria-label={`Row ${r} Column ${c} spelling crossword cell`}
                  >
                    {cell.cellNum && <span className={styles.cellNumber}>{cell.cellNum}</span>}
                    {val}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Across & Down Clues lists */}
        <div className={styles.cluesContainer}>
          <h2 className={styles.cluesTitle}>Crossword Clues 🔍</h2>

          <div className={styles.cluesSection}>
            <h3>👉 Across</h3>
            <div className={styles.clueList}>
              {acrossClues.map((item) => (
                <div
                  key={`across-${item.word}`}
                  className={`${styles.clueItem} ${activeWordId === item.word ? styles.clueItemActive : ''}`}
                >
                  <strong>{item.cellNum}.</strong> {item.clue}
                </div>
              ))}
              {acrossClues.length === 0 && <div className={styles.clueItem}>None</div>}
            </div>
          </div>

          <div className={styles.cluesSection}>
            <h3>👇 Down</h3>
            <div className={styles.clueList}>
              {downClues.map((item) => (
                <div
                  key={`down-${item.word}`}
                  className={`${styles.clueItem} ${activeWordId === item.word ? styles.clueItemActive : ''}`}
                >
                  <strong>{item.cellNum}.</strong> {item.clue}
                </div>
              ))}
              {downClues.length === 0 && <div className={styles.clueItem}>None</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Visual on-screen A-Z keypad for accessibility and touch input */}
      {!isCompleted && selectedCell && (
        <div className={styles.keyboard}>
          <div className={styles.keyboardRow}>
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
              <button key={key} className={styles.key} onClick={() => handleKeyPress(key)}>
                {key}
              </button>
            ))}
          </div>
          <div className={styles.keyboardRow}>
            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
              <button key={key} className={styles.key} onClick={() => handleKeyPress(key)}>
                {key}
              </button>
            ))}
          </div>
          <div className={styles.keyboardRow}>
            <button className={`${styles.key} ${styles.keyboardDelete}`} onClick={handleBackspace}>
              ⌫ Clear
            </button>
            {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
              <button key={key} className={styles.key} onClick={() => handleKeyPress(key)}>
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isCompleted && (
        <div className={styles.celebrationOverlay}>
          <div className={styles.celebrationCard}>
            <span className={styles.celebrationEmoji}>🦉🌈⭐</span>
            <h2>Master Speller!</h2>
            <p>Outstanding spelling crossword solution! You have super word knowledge! 🏆</p>
            <button className={styles.nextButton} onClick={() => startNewPuzzle(category)}>
              Play Again 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

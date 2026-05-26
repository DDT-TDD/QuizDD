import React, { useState, useEffect } from 'react'
import { generateWordFind, WordFindPuzzle, WORD_CATEGORIES } from '../utils/puzzleGenerator'
import styles from './WordFind.module.css'
import parentStyles from './PuzzlesView.module.css'

interface WordFindProps {
  onBack: () => void
}

type CategoryKey = 'animals' | 'science' | 'geography' | 'spelling'

export const WordFind: React.FC<WordFindProps> = ({ onBack }) => {
  const [category, setCategory] = useState<CategoryKey>('animals')
  const [puzzle, setPuzzle] = useState<WordFindPuzzle | null>(null)
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([])
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [foundCells, setFoundCells] = useState<Record<string, boolean>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  const startNewPuzzle = (cat: CategoryKey) => {
    const newPuzzle = generateWordFind(cat)
    setPuzzle(newPuzzle)
    setSelectedCells([])
    setFoundWords([])
    setFoundCells({})
    setIsCompleted(false)
  }

  useEffect(() => {
    startNewPuzzle(category)
  }, [category])

  if (!puzzle) return null

  const handleCellClick = (r: number, c: number) => {
    // Check if cell is already selected
    const selectedIdx = selectedCells.findIndex((cell) => cell.r === r && cell.c === c)
    let newSelected = [...selectedCells]

    if (selectedIdx !== -1) {
      // Remove it and all subsequent selections (undo step)
      newSelected = newSelected.slice(0, selectedIdx)
    } else {
      // Add to selection
      newSelected.push({ r, c })
    }

    setSelectedCells(newSelected)

    // Check if the current selection matches any hidden word in the puzzle
    checkWordFound(newSelected)
  }

  const checkWordFound = (coords: { r: number; c: number }[]) => {
    if (!puzzle) return

    for (const word of puzzle.words) {
      if (foundWords.includes(word)) continue

      const wordCoords = puzzle.wordLocations[word]
      if (!wordCoords) continue

      if (coords.length === wordCoords.length) {
        // Check forward match
        const forwardMatch = coords.every(
          (curr, idx) => curr.r === wordCoords[idx].r && curr.c === wordCoords[idx].c
        )

        // Check backward match
        const backwardMatch = coords.every(
          (curr, idx) =>
            curr.r === wordCoords[wordCoords.length - 1 - idx].r &&
            curr.c === wordCoords[wordCoords.length - 1 - idx].c
        )

        if (forwardMatch || backwardMatch) {
          // Found the word!
          const newFoundWords = [...foundWords, word]
          setFoundWords(newFoundWords)

          // Mark coordinates as permanently found
          const newFoundCells = { ...foundCells }
          wordCoords.forEach((coord) => {
            newFoundCells[`${coord.r}_${coord.c}`] = true
          })
          setFoundCells(newFoundCells)
          setSelectedCells([]) // Reset active selection

          // Check if all words are found
          if (newFoundWords.length === puzzle.words.length) {
            setIsCompleted(true)
          }
          return
        }
      }
    }
  }

  const handleClearSelection = () => {
    setSelectedCells([])
  }

  return (
    <div className={styles.container}>
      <button className={parentStyles.backButton} onClick={onBack}>
        ⬅️ Back to Menu
      </button>

      <div className={styles.header}>
        <h1>🔍 Word Search Grid</h1>
        <p>Find all the hidden spelling words inside the grid! Tap letter-by-letter to spell. 🌟</p>
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
                const cellKey = `${r}_${c}`
                const isFound = foundCells[cellKey]
                const isSelected = selectedCells.some((coord) => coord.r === r && coord.c === c)

                let cellClass = styles.cell
                if (isSelected) cellClass += ` ${styles.cellSelected}`
                if (isFound) cellClass += ` ${styles.cellFound}`

                return (
                  <button
                    key={cellKey}
                    className={cellClass}
                    onClick={() => handleCellClick(r, c)}
                    aria-label={`Letter ${cell.letter} at Row ${r} Column ${c}`}
                  >
                    {cell.letter}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className={styles.sidebar}>
          {/* Active selection helper showing current spelled word */}
          {selectedCells.length > 0 && (
            <div className={styles.wordListContainer} style={{ padding: '1rem' }}>
              <div style={{ textAlign: 'center', fontWeight: 700 }}>
                Spelled: <span style={{ color: '#f5576c', fontSize: '1.2rem' }}>
                  {selectedCells.map((coord) => puzzle.grid[coord.r][coord.c].letter).join('')}
                </span>
              </div>
              <div className={styles.selectionControls} style={{ marginTop: '0.8rem' }}>
                <button className={styles.clearButton} onClick={handleClearSelection}>
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* List of words to search */}
          <div className={styles.wordListContainer}>
            <h2 className={styles.sidebarTitle}>Words to Find ({foundWords.length}/{puzzle.words.length})</h2>
            <div className={styles.wordList}>
              {puzzle.words.map((word) => {
                const isFound = foundWords.includes(word)
                return (
                  <div
                    key={word}
                    className={`${styles.wordItem} ${isFound ? styles.wordItemFound : ''}`}
                  >
                    {isFound ? '✅' : '👀'} {word}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration overlay */}
      {isCompleted && (
        <div className={styles.celebrationOverlay}>
          <div className={styles.celebrationCard}>
            <span className={styles.celebrationEmoji}>🕵️‍♂️🦖🎉</span>
            <h2>Super Word Finder!</h2>
            <p>You found all the hidden words perfectly! You have amazing observation skills! 🏆</p>
            <button className={styles.nextButton} onClick={() => startNewPuzzle(category)}>
              Play Again 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

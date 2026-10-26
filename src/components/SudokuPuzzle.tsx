import React, { useState, useEffect, useCallback } from 'react'
import {
  generateSudoku,
  findSudokuConflicts,
  SudokuPuzzle as ISudokuPuzzle,
  SudokuSize,
  SudokuDifficulty,
  SudokuSymbolType,
  SudokuCell
} from '../utils/puzzleGenerator'
import styles from './SudokuPuzzle.module.css'
import parentStyles from './PuzzlesView.module.css'

interface SudokuPuzzleProps {
  onBack: () => void
}

export const SudokuPuzzle: React.FC<SudokuPuzzleProps> = ({ onBack }) => {
  const [size, setSize] = useState<SudokuSize>(4)
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy')
  const [theme, setTheme] = useState<SudokuSymbolType>('animals')
  const [puzzle, setPuzzle] = useState<ISudokuPuzzle | null>(null)
  const [grid, setGrid] = useState<SudokuCell[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [conflicts, setConflicts] = useState<Set<string>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)

  // Start a new game
  const startNewGame = useCallback((
    targetSize: SudokuSize = size,
    targetDiff: SudokuDifficulty = difficulty,
    targetTheme: SudokuSymbolType = theme
  ) => {
    const newPuzzle = generateSudoku(targetSize, targetDiff, targetTheme)
    setPuzzle(newPuzzle)
    // Deep clone grid
    setGrid(newPuzzle.grid.map(row => row.map(cell => ({ ...cell }))))
    setSelectedCell(null)
    setConflicts(new Set())
    setIsCompleted(false)
    setHintsUsed(0)
  }, [size, difficulty, theme])

  useEffect(() => {
    startNewGame(size, difficulty, theme)
  }, [size, difficulty, theme, startNewGame])

  // Check board status whenever grid updates
  const updateConflictsAndCheckWin = (newGrid: SudokuCell[][]) => {
    if (!puzzle) return

    const conflictCoords = findSudokuConflicts(newGrid, puzzle.size, puzzle.boxRows, puzzle.boxCols)
    const conflictSet = new Set(conflictCoords.map(c => `${c.row},${c.col}`))
    setConflicts(conflictSet)

    // Check if completely and correctly filled
    let allFilled = true
    let allCorrect = true
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const val = newGrid[r][c].value
        if (val === 0) {
          allFilled = false
        } else if (val !== newGrid[r][c].solutionValue) {
          allCorrect = false
        }
      }
    }

    if (allFilled && conflictCoords.length === 0 && allCorrect) {
      setIsCompleted(true)
    }
  }

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({ r, c })
  }

  // Handle entering a value (1..size)
  const handleInputDigit = (digit: number) => {
    if (!selectedCell || isCompleted) return
    const { r, c } = selectedCell
    const targetCell = grid[r][c]
    if (targetCell.isGiven) return

    const updatedGrid = grid.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === r && ci === c) {
          return { ...cell, value: digit }
        }
        return cell
      })
    )

    setGrid(updatedGrid)
    updateConflictsAndCheckWin(updatedGrid)
  }

  // Erase value from selected cell
  const handleErase = () => {
    if (!selectedCell || isCompleted) return
    const { r, c } = selectedCell
    if (grid[r][c].isGiven) return

    const updatedGrid = grid.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === r && ci === c) {
          return { ...cell, value: 0 }
        }
        return cell
      })
    )

    setGrid(updatedGrid)
    updateConflictsAndCheckWin(updatedGrid)
  }

  // Provide a hint
  const handleHint = () => {
    if (!puzzle || isCompleted) return

    // Find all empty or incorrect non-given cells
    const candidateCells: { r: number; c: number }[] = []
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (!grid[r][c].isGiven && grid[r][c].value !== grid[r][c].solutionValue) {
          candidateCells.push({ r, c })
        }
      }
    }

    if (candidateCells.length === 0) return

    // Pick random candidate cell
    const randomCell = candidateCells[Math.floor(Math.random() * candidateCells.length)]
    const updatedGrid = grid.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === randomCell.r && ci === randomCell.c) {
          return { ...cell, value: cell.solutionValue }
        }
        return cell
      })
    )

    setGrid(updatedGrid)
    setSelectedCell(randomCell)
    setHintsUsed(prev => prev + 1)
    updateConflictsAndCheckWin(updatedGrid)
  }

  // Keyboard navigation and input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || !puzzle) return

      if (e.key >= '1' && e.key <= String(puzzle.size)) {
        handleInputDigit(parseInt(e.key, 10))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleErase()
      } else if (e.key.startsWith('Arrow') && selectedCell) {
        e.preventDefault()
        let { r, c } = selectedCell
        if (e.key === 'ArrowUp') r = Math.max(0, r - 1)
        if (e.key === 'ArrowDown') r = Math.min(puzzle.size - 1, r + 1)
        if (e.key === 'ArrowLeft') c = Math.max(0, c - 1)
        if (e.key === 'ArrowRight') c = Math.min(puzzle.size - 1, c + 1)
        setSelectedCell({ r, c })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCell, isCompleted, puzzle, grid])

  if (!puzzle) return null

  // Value to display (number or emoji)
  const getDisplaySymbol = (val: number) => {
    if (val === 0) return ''
    return puzzle.symbols[val - 1] || String(val)
  }

  const selectedValue = selectedCell ? grid[selectedCell.r][selectedCell.c].value : null

  return (
    <div className={styles.sudokuContainer}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <button 
            className={parentStyles.backButton}
            onClick={onBack}
            aria-label="Back to puzzles menu"
          >
            ← Back
          </button>
          <div>
            <h2>Kids Sudoku Adventures 🧩</h2>
            <p className={styles.subtitle}>
              {size === 4 ? 'Mini 4×4 for Beginners' : size === 6 ? 'Junior 6×6 Fun' : 'Classic 9×9 Challenge'}
            </p>
          </div>
        </div>

        {isCompleted && (
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38a169' }}>
            🎉 Puzzle Solved!
          </span>
        )}
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        {/* Size Selection */}
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Grid:</span>
          <div className={styles.pillGroup}>
            <button
              className={`${styles.pillButton} ${size === 4 ? styles.pillButtonActive : ''}`}
              onClick={() => setSize(4)}
            >
              4×4 (KS1)
            </button>
            <button
              className={`${styles.pillButton} ${size === 6 ? styles.pillButtonActive : ''}`}
              onClick={() => setSize(6)}
            >
              6×6 (Junior)
            </button>
            <button
              className={`${styles.pillButton} ${size === 9 ? styles.pillButtonActive : ''}`}
              onClick={() => setSize(9)}
            >
              9×9 (KS2)
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Symbols:</span>
          <div className={styles.pillGroup}>
            <button
              className={`${styles.pillButton} ${theme === 'animals' ? styles.pillButtonActive : ''}`}
              onClick={() => setTheme('animals')}
              aria-label="Animals symbols"
            >
              🐾 Animals
            </button>
            <button
              className={`${styles.pillButton} ${theme === 'numbers' ? styles.pillButtonActive : ''}`}
              onClick={() => setTheme('numbers')}
              aria-label="Numbers symbols"
            >
              🔢 Numbers
            </button>
            <button
              className={`${styles.pillButton} ${theme === 'space' ? styles.pillButtonActive : ''}`}
              onClick={() => setTheme('space')}
              aria-label="Space symbols"
            >
              🚀 Space
            </button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Level:</span>
          <div className={styles.pillGroup}>
            {(['easy', 'medium', 'hard'] as SudokuDifficulty[]).map(lvl => (
              <button
                key={lvl}
                className={`${styles.pillButton} ${difficulty === lvl ? styles.pillButtonActive : ''}`}
                onClick={() => setDifficulty(lvl)}
              >
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className={styles.gameArea}>
        {isCompleted ? (
          <div className={styles.winBanner}>
            <div className={styles.winEmoji}>🏆 ⭐ 🌟</div>
            <h3>Fantastic Job!</h3>
            <p>
              You cracked the {size}×{size} Sudoku puzzle!
              {hintsUsed > 0 ? ` (Hints used: ${hintsUsed})` : ' Solved with zero hints! Brilliant!'}
            </p>
            <button className={styles.playAgainBtn} onClick={() => startNewGame()}>
              Play Another Puzzle 🎮
            </button>
          </div>
        ) : (
          <div className={styles.gridWrapper}>
            <div
              className={styles.board}
              style={{
                gridTemplateColumns: `repeat(${size}, ${size === 9 ? '42px' : size === 6 ? '56px' : '72px'})`,
                gridTemplateRows: `repeat(${size}, ${size === 9 ? '42px' : size === 6 ? '56px' : '72px'})`
              }}
              role="grid"
              aria-label="Sudoku Board"
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c
                  const isError = conflicts.has(`${r},${c}`)
                  const isHighlightSame =
                    selectedValue && selectedValue > 0 && cell.value === selectedValue

                  // Block boundary lines
                  const isBorderRight = (c + 1) % puzzle.boxCols === 0 && c + 1 < puzzle.size
                  const isBorderBottom = (r + 1) % puzzle.boxRows === 0 && r + 1 < puzzle.size

                  return (
                    <button
                      key={`${r}-${c}`}
                      className={`
                        ${styles.cell}
                        ${cell.isGiven ? styles.given : styles.userInput}
                        ${isSelected ? styles.selected : ''}
                        ${isError ? styles.error : ''}
                        ${isHighlightSame && !isSelected ? styles.highlightSame : ''}
                        ${isBorderRight ? styles.borderRightThick : ''}
                        ${isBorderBottom ? styles.borderBottomThick : ''}
                      `}
                      onClick={() => handleCellClick(r, c)}
                      aria-label={`Row ${r + 1}, Column ${c + 1}: ${
                        cell.value > 0 ? getDisplaySymbol(cell.value) : 'empty'
                      }`}
                    >
                      {getDisplaySymbol(cell.value)}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Interactive Keypad */}
        {!isCompleted && (
          <div className={styles.keypad} role="toolbar" aria-label="Sudoku inputs">
            {puzzle.symbols.map((symbol, idx) => {
              const digitVal = idx + 1
              return (
                <button
                  key={symbol}
                  className={styles.keypadButton}
                  onClick={() => handleInputDigit(digitVal)}
                  aria-label={`Enter ${symbol}`}
                >
                  {symbol}
                </button>
              )
            })}
            <button
              className={`${styles.keypadButton} ${styles.eraseButton}`}
              onClick={handleErase}
              aria-label="Erase cell"
            >
              ⌫ Clear
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!isCompleted && (
          <div className={styles.actionsBar}>
            <button className={`${styles.actionBtn} ${styles.hintBtn}`} onClick={handleHint}>
              💡 Need a Hint?
            </button>
            <button className={`${styles.actionBtn} ${styles.newGameBtn}`} onClick={() => startNewGame()}>
              🔄 New Puzzle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

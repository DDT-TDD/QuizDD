import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { 
  generateMathCrossword, 
  generateWordCrossword, 
  generateWordFind,
  generateSudoku,
  findSudokuConflicts
} from '../../utils/puzzleGenerator'
import { PuzzlesView } from '../PuzzlesView'
import { MathCrossword } from '../MathCrossword'
import { WordCrossword } from '../WordCrossword'
import { WordFind } from '../WordFind'
import { SudokuPuzzle } from '../SudokuPuzzle'

// Mock Lottie animations
vi.mock('lottie-react', () => ({
  default: vi.fn(() => <div data-testid="mock-lottie" />),
}))

describe('Puzzle Generator Algorithms', () => {
  it('generates a valid math crossword puzzle structure', () => {
    const puzzle = generateMathCrossword('KS1')
    expect(puzzle.grid.length).toBe(14)
    expect(puzzle.equations.length).toBe(4)
    
    // Grid cells check
    let inputCount = 0
    puzzle.grid.forEach(row => {
      row.forEach(cell => {
        if (cell.isInput) {
          inputCount++
          expect(cell.correctDigit).toBeDefined()
        }
      })
    })
    expect(inputCount).toBeGreaterThan(0)
  })

  it('generates a valid word crossword puzzle structure', () => {
    const puzzle = generateWordCrossword('animals')
    expect(puzzle.grid.length).toBe(10)
    expect(puzzle.placedWords.length).toBeGreaterThan(0)
    
    let inputCount = 0
    puzzle.grid.forEach(row => {
      row.forEach(cell => {
        if (cell.isInput) {
          inputCount++
          expect(cell.letter).toBeDefined()
        }
      })
    })
    expect(inputCount).toBeGreaterThan(0)
  })

  it('generates a valid Word Find puzzle structure', () => {
    const puzzle = generateWordFind('science')
    expect(puzzle.grid.length).toBe(10)
    expect(puzzle.words.length).toBe(6)
    
    puzzle.words.forEach(word => {
      expect(puzzle.wordLocations[word]).toBeDefined()
      expect(puzzle.wordLocations[word].length).toBe(word.length)
    })
  })

  it('generates valid Sudoku for kids of sizes 4, 6, and 9', () => {
    // 4x4
    const puzzle4 = generateSudoku(4, 'easy', 'numbers')
    expect(puzzle4.grid.length).toBe(4)
    expect(puzzle4.boxRows).toBe(2)
    expect(puzzle4.boxCols).toBe(2)
    expect(puzzle4.symbols.length).toBe(4)

    // Verify given cells and solutions
    let givenCount4 = 0
    puzzle4.grid.forEach(row => {
      expect(row.length).toBe(4)
      row.forEach(cell => {
        expect(cell.solutionValue).toBeGreaterThanOrEqual(1)
        expect(cell.solutionValue).toBeLessThanOrEqual(4)
        if (cell.isGiven) givenCount4++
      })
    })
    expect(givenCount4).toBe(10) // Easy 4x4 has 10 given clues

    // 6x6
    const puzzle6 = generateSudoku(6, 'medium', 'animals')
    expect(puzzle6.grid.length).toBe(6)
    expect(puzzle6.boxRows).toBe(2)
    expect(puzzle6.boxCols).toBe(3)
    expect(puzzle6.symbols.length).toBe(6)

    // 9x9
    const puzzle9 = generateSudoku(9, 'hard', 'space')
    expect(puzzle9.grid.length).toBe(9)
    expect(puzzle9.boxRows).toBe(3)
    expect(puzzle9.boxCols).toBe(3)
    expect(puzzle9.symbols.length).toBe(9)
  })

  it('accurately identifies conflicts in Sudoku grid', () => {
    const mockGrid = [
      [{ value: 1 }, { value: 1 }, { value: 3 }, { value: 4 }],
      [{ value: 3 }, { value: 4 }, { value: 1 }, { value: 2 }],
      [{ value: 2 }, { value: 3 }, { value: 4 }, { value: 1 }],
      [{ value: 4 }, { value: 2 }, { value: 2 }, { value: 3 }]
    ]
    const conflicts = findSudokuConflicts(mockGrid, 4, 2, 2)
    expect(conflicts.length).toBeGreaterThan(0)
  })
})

describe('Puzzles UI Components', () => {
  it('renders PuzzlesView selection dashboard with Sudoku', () => {
    render(<PuzzlesView />)
    expect(screen.getByText(/Mind Gym Puzzles/)).toBeInTheDocument()
    expect(screen.getByText(/Kids Sudoku/)).toBeInTheDocument()
    expect(screen.getByText(/Math Crosswords/)).toBeInTheDocument()
    expect(screen.getByText(/Spelling Crosswords/)).toBeInTheDocument()
    expect(screen.getByText(/Word Search/)).toBeInTheDocument()
  })

  it('renders SudokuPuzzle game view and toggles grid sizes', () => {
    render(<SudokuPuzzle onBack={vi.fn()} />)
    expect(screen.getByText(/Kids Sudoku Adventures/)).toBeInTheDocument()
    
    // Toggle to 6x6
    const btn6x6 = screen.getByText(/6×6 \(Junior\)/)
    fireEvent.click(btn6x6)
    expect(btn6x6).toHaveClass(/pillButtonActive/)

    // Toggle theme to Numbers
    const numThemeBtn = screen.getByText(/🔢 Numbers/)
    fireEvent.click(numThemeBtn)
    expect(numThemeBtn).toHaveClass(/pillButtonActive/)
  })

  it('allows clicking cell and requesting hint in SudokuPuzzle', () => {
    render(<SudokuPuzzle onBack={vi.fn()} />)
    const hintBtn = screen.getByRole('button', { name: /need a hint/i })
    expect(hintBtn).toBeInTheDocument()
    fireEvent.click(hintBtn)
  })

  it('renders MathCrossword game view and toggles Key Stages', () => {
    render(<MathCrossword onBack={vi.fn()} />)
    expect(screen.getByText(/Math Crosswords/)).toBeInTheDocument()
    
    const ks2Button = screen.getByText('Key Stage 2 (Ages 7-11) ⭐')
    fireEvent.click(ks2Button)
    expect(ks2Button).toHaveClass(/diffButtonActive/)
  })

  it('renders WordCrossword game view and shifts categories', () => {
    render(<WordCrossword onBack={vi.fn()} />)
    expect(screen.getByText(/Spelling Crosswords/)).toBeInTheDocument()
    
    const scienceCat = screen.getByText(/Science Exploration/)
    fireEvent.click(scienceCat)
    expect(scienceCat).toHaveClass(/catButtonActive/)
  })

  it('renders WordFind game view and handles clear selection', () => {
    render(<WordFind onBack={vi.fn()} />)
    expect(screen.getByText(/Word Search Grid/)).toBeInTheDocument()
    
    // Clicking a cell starts selection
    const buttons = screen.getAllByRole('button')
    // Find first cell button in grid (it will have an aria-label with Letter...)
    const gridCellButton = buttons.find(b => b.getAttribute('aria-label')?.includes('Letter'))
    
    if (gridCellButton) {
      fireEvent.click(gridCellButton)
      expect(screen.getByText(/Spelled:/)).toBeInTheDocument()
      
      const clearButton = screen.getByText('Clear Selection')
      fireEvent.click(clearButton)
      expect(screen.queryByText(/Spelled:/)).not.toBeInTheDocument()
    }
  })
})

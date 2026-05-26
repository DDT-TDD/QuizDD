import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { 
  generateMathCrossword, 
  generateWordCrossword, 
  generateWordFind 
} from '../../utils/puzzleGenerator'
import { PuzzlesView } from '../PuzzlesView'
import { MathCrossword } from '../MathCrossword'
import { WordCrossword } from '../WordCrossword'
import { WordFind } from '../WordFind'

// Mock Lottie animations
vi.mock('lottie-react', () => ({
  default: vi.fn(() => <div data-testid="mock-lottie" />),
}))

describe('Puzzle Generator Algorithms', () => {
  it('generates a valid math crossword puzzle structure', () => {
    const puzzle = generateMathCrossword('KS1')
    expect(puzzle.grid.length).toBe(9)
    expect(puzzle.equations.length).toBe(2)
    
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
})

describe('Puzzles UI Components', () => {
  it('renders PuzzlesView selection dashboard', () => {
    render(<PuzzlesView />)
    expect(screen.getByText(/Mind Gym Puzzles/)).toBeInTheDocument()
    expect(screen.getByText(/Math Crosswords/)).toBeInTheDocument()
    expect(screen.getByText(/Spelling Crosswords/)).toBeInTheDocument()
    expect(screen.getByText(/Word Search/)).toBeInTheDocument()
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

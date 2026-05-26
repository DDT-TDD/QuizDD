import React, { useState } from 'react'
import { MathCrossword } from './MathCrossword'
import { WordCrossword } from './WordCrossword'
import { WordFind } from './WordFind'
import styles from './PuzzlesView.module.css'

export type ActiveGame = 'menu' | 'math' | 'crossword' | 'wordfind'

export const PuzzlesView: React.FC = () => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu')

  const renderGame = () => {
    switch (activeGame) {
      case 'math':
        return <MathCrossword onBack={() => setActiveGame('menu')} />
      case 'crossword':
        return <WordCrossword onBack={() => setActiveGame('menu')} />
      case 'wordfind':
        return <WordFind onBack={() => setActiveGame('menu')} />
      default:
        return (
          <div className={styles.puzzlesDashboard}>
            <div className={styles.header}>
              <h1>🧩 Mind Gym Puzzles</h1>
              <p>Solve crossing equations, spelling crosswords, and word search grids! 🌟</p>
            </div>

            <div className={styles.grid}>
              {/* Math Crossword */}
              <div 
                className={styles.puzzleCard}
                style={{
                  '--card-color-start': '#00c6ff',
                  '--card-color-end': '#0072ff'
                } as React.CSSProperties}
                onClick={() => setActiveGame('math')}
              >
                <div className={styles.iconContainer}>➕</div>
                <h2>Math Crosswords</h2>
                <p>Crack the mathematical crossword codes! Align and solve crossing arithmetic equations for addition, multiplication, and division.</p>
                <button className={styles.playButton}>Play Math</button>
              </div>

              {/* Word Crossword */}
              <div 
                className={styles.puzzleCard}
                style={{
                  '--card-color-start': '#ff0844',
                  '--card-color-end': '#ffb199'
                } as React.CSSProperties}
                onClick={() => setActiveGame('crossword')}
              >
                <div className={styles.iconContainer}>🔠</div>
                <h2>Spelling Crosswords</h2>
                <p>Build your vocabulary by solving standard crossword puzzles filled with animals, science, and world geography clues.</p>
                <button className={styles.playButton}>Play Spelling</button>
              </div>

              {/* Word Find */}
              <div 
                className={styles.puzzleCard}
                style={{
                  '--card-color-start': '#f093fb',
                  '--card-color-end': '#f5576c'
                } as React.CSSProperties}
                onClick={() => setActiveGame('wordfind')}
              >
                <div className={styles.iconContainer}>🔍</div>
                <h2>Word Search</h2>
                <p>Test your observation skills! Search and find hidden vocabulary words hidden inside a grid of random letters.</p>
                <button className={styles.playButton}>Play Search</button>
              </div>
            </div>
          </div>
        )
    }
  }

  return <>{renderGame()}</>
}

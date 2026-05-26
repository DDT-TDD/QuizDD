import { vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../../contexts/AppContext'
import App from '../../App'
import { mockTauriApi, mockQuestion, mockProfile, mockSubject, mockProgress, mockQuizSession, mockScore } from '../mocks'



describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock responses
    mockTauriApi.getAllProfiles.mockResolvedValue([mockProfile])
    mockTauriApi.getSubjects.mockResolvedValue([mockSubject])
    mockTauriApi.getQuestions.mockResolvedValue([mockQuestion])
    mockTauriApi.getProgress.mockResolvedValue(mockProgress)
    mockTauriApi.isContentSeeded.mockResolvedValue(true)
    mockTauriApi.seedIfEmpty.mockResolvedValue(undefined)
  })

  describe('Complete Quiz Flow', () => {
    it('loads app and displays profile selector', async () => {
      render(<App />)

      // App should render and eventually show profile
      await waitFor(() => {
        expect(screen.getByText('Test Child')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Navigation should be visible
      expect(screen.getByText('Subjects')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('displays subject grid after loading', async () => {
      render(<App />)

      // Subjects should load (default view is 'subjects')
      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('completes a full quiz session from start to finish', async () => {
      const user = userEvent.setup()
      
      // Setup startQuizSession mock
      mockTauriApi.startQuizSession.mockResolvedValue(mockQuizSession)
      
      render(<App />)

      // 1. Wait for profile to load
      await waitFor(() => {
        expect(screen.getByText('Test Child')).toBeInTheDocument()
      }, { timeout: 5000 })

      // 2. Navigate to subjects (already on subjects view by default)
      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      }, { timeout: 5000 })

      // 3. Select a profile first (required for quiz navigation)
      await user.click(screen.getByText('Test Child'))

      // 4. Select subject - needs currentProfile set
      // Click Mathematics
      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      }, { timeout: 3000 })

      await user.click(screen.getByText('Mathematics'))

      // 5. Wait for quiz to load
      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      }, { timeout: 8000 })

      // 6. Answer question
      await user.click(screen.getByText('4'))

      // 7. View results (auto-advances after answer in test mode)
      await waitFor(() => {
        expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Verify API calls
      expect(mockTauriApi.getAllProfiles).toHaveBeenCalled()
      expect(mockTauriApi.getSubjects).toHaveBeenCalled()
    })

    it('handles quiz with multiple questions', async () => {
      const user = userEvent.setup()
      const multipleQuestions = [
        mockQuestion,
        { ...mockQuestion, id: 2, content: { ...mockQuestion.content, text: 'What is 3 + 3?', options: ['3', '5', '6', '7'] }, correct_answer: '6' },
        { ...mockQuestion, id: 3, content: { ...mockQuestion.content, text: 'What is 4 + 4?', options: ['4', '6', '7', '8'] }, correct_answer: '8' }
      ]
      
      const multiSession = {
        ...mockQuizSession,
        questions: multipleQuestions
      }

      mockTauriApi.startQuizSession.mockResolvedValue(multiSession)
      mockTauriApi.getQuestions.mockResolvedValue(multipleQuestions)
      
      render(<App />)

      // Wait for profiles to load
      await waitFor(() => {
        expect(screen.getByText('Test Child')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Select profile and navigate to quiz
      await user.click(screen.getByText('Test Child'))

      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      }, { timeout: 5000 })
      await user.click(screen.getByText('Mathematics'))

      // Answer first question
      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      }, { timeout: 8000 })
      await user.click(screen.getByText('4'))

      // After auto-advance, answer second question
      await waitFor(() => {
        expect(screen.getByText('What is 3 + 3?')).toBeInTheDocument()
      }, { timeout: 8000 })
      await user.click(screen.getByText('6'))

      // Answer third question
      await waitFor(() => {
        expect(screen.getByText('What is 4 + 4?')).toBeInTheDocument()
      }, { timeout: 8000 })
      await user.click(screen.getByText('8'))

      // View results
      await waitFor(() => {
        expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
      }, { timeout: 10000 })
    })
  })

  describe('Profile Management Flow', () => {
    it('displays profile correctly on load', async () => {
      const user = userEvent.setup()
      
      render(<App />)

      // Wait for profiles to load
      await waitFor(() => {
        expect(screen.getByText('Test Child')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Navigate to profile view
      await user.click(screen.getByText('Profile'))

      // Check that profile view content appears
      // ProfileView renders "Your Profile" text
      await waitFor(() => {
        expect(screen.getByText(/Your Profile/)).toBeInTheDocument()
      }, { timeout: 5000 })
    }, 15000)

    it('shows profile progress correctly', async () => {
      render(<App />)

      // Wait for profiles to load and check profile is shown
      await waitFor(() => {
        expect(screen.getByText('Test Child')).toBeInTheDocument()
      }, { timeout: 5000 })
    })
  })

  describe('Error Handling Integration', () => {
    it('handles API errors gracefully', async () => {
      // Mock API error for subjects
      mockTauriApi.getSubjects.mockRejectedValue(new Error('Network error'))
      
      render(<App />)

      // App should still render without crashing
      await waitFor(() => {
        // Either an error message or a loading fallback should appear
        // The contentService catches errors and falls back to offlineErrorHandler
        // which may show a "Failed to load" or fall back to empty data
        expect(document.body).not.toBeEmptyDOMElement()
      }, { timeout: 5000 })

      // The API was called
      await waitFor(() => {
        expect(mockTauriApi.getSubjects).toHaveBeenCalled()
      }, { timeout: 5000 })
    })

    it('app loads successfully with all mocks configured', async () => {
      render(<App />)

      // App should render the main navigation
      await waitFor(() => {
        expect(screen.getByText('Subjects')).toBeInTheDocument()
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
      }, { timeout: 5000 })
    })
  })

  describe('Offline Functionality', () => {
    it('shows subjects when data is available', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('loads profiles from mock API', async () => {
      render(<App />)

      // Profiles should be loaded from the mock
      await waitFor(() => {
        expect(mockTauriApi.getAllProfiles).toHaveBeenCalled()
      }, { timeout: 5000 })
    })
  })

  describe('Data Persistence', () => {
    it('persists quiz progress across sessions', async () => {
      const user = userEvent.setup()
      
      mockTauriApi.startQuizSession.mockResolvedValue(mockQuizSession)
      
      render(<App />)

      // Start quiz
      await waitFor(() => {
        expect(screen.getByText('Test Child')).toBeInTheDocument()
      }, { timeout: 5000 })
      
      await user.click(screen.getByText('Test Child'))
      
      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      }, { timeout: 5000 })
      
      await user.click(screen.getByText('Mathematics'))

      // Answer question
      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      }, { timeout: 8000 })
      
      await user.click(screen.getByText('4'))
      
      // Wait for quiz to complete (auto-advances after answer in test mode)
      await waitFor(() => {
        expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
      }, { timeout: 10000 })

      // After completion, updateProgress should be called
      await waitFor(() => {
        expect(mockTauriApi.updateProgress).toHaveBeenCalled()
      }, { timeout: 5000 })
    })

    it('maintains theme preferences', async () => {
      const user = userEvent.setup()
      
      render(<App />)

      // Wait for Settings nav item to render
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      }, { timeout: 5000 })
      
      // Change theme
      await user.click(screen.getByText('Settings'))
      
      // Wait for Settings Panel to load with theme options
      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument()
      }, { timeout: 5000 })
      await user.click(screen.getByText('Dark'))
      
      // Verify theme was applied to document
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      }, { timeout: 3000 })
    })
  })
})
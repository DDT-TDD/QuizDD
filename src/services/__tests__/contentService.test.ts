import { vi } from 'vitest'
import { contentService } from '../contentService'
import { mockTauriApi, mockSubject, mockQuestion } from '../../test/mocks'

// Mock offlineService - use vi.fn() without values (no top-level variable references in factory)
vi.mock('../offlineService', () => ({
  offlineService: {
    getSubjects: vi.fn(),
    getQuestions: vi.fn(),
  },
  default: {
    getSubjects: vi.fn(),
    getQuestions: vi.fn(),
  }
}))

// Mock offlineErrorHandler to prevent errors
vi.mock('../offlineErrorHandler', () => ({
  offlineErrorHandler: {
    handleError: vi.fn().mockResolvedValue([]),
  }
}))

describe('ContentService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Set up mock values AFTER clearing (avoid hoisting issue)
    const { offlineService } = await import('../offlineService')
    vi.mocked(offlineService.getSubjects).mockResolvedValue([mockSubject])
    vi.mocked(offlineService.getQuestions).mockResolvedValue([mockQuestion])
  })

  describe('getSubjects', () => {
    it('fetches subjects from offlineService', async () => {
      const subjects = await contentService.getSubjects()
      expect(subjects).toEqual([mockSubject])
    })
  })

  describe('getQuestions', () => {
    it('fetches questions with correct parameters', async () => {
      const request = {
        subject: 'Mathematics',
        key_stage: 'KS1' as const,
        count: 10
      }
      
      const questions = await contentService.getQuestions(request)
      expect(questions).toEqual([mockQuestion])
    })
  })

  describe('validateQuizConfiguration', () => {
    it('validates configuration correctly when enough questions exist', async () => {
      const result = await contentService.validateQuizConfiguration('Mathematics', 'KS1', 1)
      expect(result.valid).toBe(true)
    })
  })
})
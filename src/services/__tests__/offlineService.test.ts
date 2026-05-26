import { vi } from 'vitest'
import { offlineService } from '../offlineService'
import { mockSubject, mockProfile } from '../../test/mocks'


describe('OfflineService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('offline status', () => {
    it('returns default offline capabilities status', () => {
      const status = offlineService.getOfflineStatus()
      expect(status.cachedSubjects).toBeDefined()
      expect(status.cachedQuestions).toBeDefined()
      expect(status.isOfflineReady).toBeDefined()
    })

    it('returns internal state representation', () => {
      const state = offlineService.getState()
      expect(state.isOnline).toBeDefined()
      expect(state.cachedData).toBeDefined()
    })
  })

  describe('cached retrievals', () => {
    it('retrieves cached profiles successfully', async () => {
      const profiles = await offlineService.getProfiles()
      expect(profiles).toEqual([mockProfile])
    })

    it('retrieves cached subjects successfully', async () => {
      const subjects = await offlineService.getSubjects()
      expect(subjects).toEqual([mockSubject])
    })
  })
})
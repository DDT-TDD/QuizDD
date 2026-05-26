import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { mockTauriApi } from './mocks'

// Mock Tauri API
const mockTauri = {
  invoke: vi.fn(),
  listen: vi.fn(),
  emit: vi.fn(),
}

// Mock window.__TAURI__
Object.defineProperty(window, '__TAURI__', {
  value: mockTauri,
  writable: true,
})

// Mock window.__TAURI_INVOKE__
Object.defineProperty(window, '__TAURI_INVOKE__', {
  value: vi.fn().mockImplementation((command, args) => {
    // Map snake_case command names (Tauri backend commands) to camelCase mock methods in mockTauriApi
    const camelCaseCommand = command.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
    
    // Explicit mappings for commands
    let mockMethodName = camelCaseCommand
    if (command === 'get_all_profiles') {
      mockMethodName = 'getAllProfiles'
    } else if (command === 'get_profile_by_id') {
      mockMethodName = 'getProfileById'
    } else if (command === 'get_subjects') {
      mockMethodName = 'getSubjects'
    } else if (command === 'get_questions') {
      mockMethodName = 'getQuestions'
    } else if (command === 'get_questions_by_subject') {
      mockMethodName = 'getQuestionsBySubject'
    } else if (command === 'get_question_by_id') {
      mockMethodName = 'getQuestionById'
    } else if (command === 'get_content_statistics') {
      mockMethodName = 'getContentStatistics'
    } else if (command === 'is_content_seeded') {
      mockMethodName = 'isContentSeeded'
    } else if (command === 'validate_answer') {
      mockMethodName = 'validateAnswer'
    } else if (command === 'start_quiz_session') {
      mockMethodName = 'startQuizSession'
    } else if (command === 'submit_answer') {
      mockMethodName = 'submitAnswer'
    } else if (command === 'calculate_score') {
      mockMethodName = 'calculateScore'
    } else if (command === 'pause_quiz') {
      mockMethodName = 'pauseQuiz'
    } else if (command === 'resume_quiz') {
      mockMethodName = 'resumeQuiz'
    } else if (command === 'get_progress') {
      mockMethodName = 'getProgress'
    } else if (command === 'update_progress') {
      mockMethodName = 'updateProgress'
    } else if (command === 'create_custom_mix') {
      mockMethodName = 'createCustomMix'
    } else if (command === 'get_custom_mix_by_id') {
      mockMethodName = 'getCustomMixById'
    } else if (command === 'get_all_custom_mixes') {
      mockMethodName = 'getAllCustomMixes'
    } else if (command === 'get_custom_mixes_by_profile') {
      mockMethodName = 'getCustomMixesByProfile'
    } else if (command === 'update_custom_mix') {
      mockMethodName = 'updateCustomMix'
    } else if (command === 'delete_custom_mix') {
      mockMethodName = 'deleteCustomMix'
    } else if (command === 'get_available_question_count') {
      mockMethodName = 'getAvailableQuestionCount'
    } else if (command === 'validate_mix_feasibility') {
      mockMethodName = 'validateMixFeasibility'
    } else if (command === 'validate_parental_access') {
      mockMethodName = 'validateParentalAccess'
    } else if (command === 'generate_parental_challenge') {
      mockMethodName = 'generateParentalChallenge'
    } else if (command === 'validate_parental_feature_access') {
      mockMethodName = 'validateParentalFeatureAccess'
    } else if (command === 'generate_parental_session_token') {
      mockMethodName = 'generateParentalSessionToken'
    } else if (command === 'get_quiz_progress') {
      mockMethodName = 'getQuizProgress'
    } else if (command === 'check_for_updates') {
      mockMethodName = 'checkForUpdates'
    } else if (command === 'download_and_install_update') {
      mockMethodName = 'downloadAndInstallUpdate'
    } else if (command === 'rollback_to_backup') {
      mockMethodName = 'rollbackToBackup'
    } else if (command === 'get_current_version') {
      mockMethodName = 'getCurrentVersion'
    } else if (command === 'list_backups') {
      mockMethodName = 'listBackups'
    } else if (command === 'get_database_stats') {
      mockMethodName = 'getDatabaseStats'
    } else if (command === 'get_database_version') {
      mockMethodName = 'getDatabaseVersion'
    } else if (command === 'save_settings') {
      mockMethodName = 'saveSettings'
    } else if (command === 'get_settings') {
      mockMethodName = 'getSettings'
    }

    const mockMethod = (mockTauriApi as any)[mockMethodName]
    
    if (mockMethod) {
      if (args && typeof args === 'object') {
        if (command === 'create_profile') {
          return mockMethod(args.request)
        } else if (command === 'get_profile_by_id') {
          return mockMethod(args.profileId)
        } else if (command === 'update_profile') {
          return mockMethod(args.profileId, args.updates)
        } else if (command === 'delete_profile') {
          return mockMethod(args.profileId)
        } else if (command === 'get_progress') {
          return mockMethod(args.profileId)
        } else if (command === 'update_progress') {
          return mockMethod(args.profileId, args.quizResult)
        } else if (command === 'get_questions') {
          return mockMethod(args.request)
        } else if (command === 'validate_answer') {
          return mockMethod(args.questionId, args.submittedAnswer)
        } else if (command === 'start_quiz_session') {
          return mockMethod(args.profileId, args.config)
        } else if (command === 'submit_answer') {
          return mockMethod(args.sessionId, args.answer, args.timeTakenSeconds)
        } else if (command === 'get_current_question') {
          return mockMethod(args.sessionId)
        } else if (command === 'calculate_score') {
          return mockMethod(args.quizSession)
        } else if (command === 'pause_quiz') {
          return mockMethod(args.sessionId)
        } else if (command === 'resume_quiz') {
          return mockMethod(args.sessionId)
        } else if (command === 'get_questions_by_subject') {
          return mockMethod(args.subjectName, args.keyStage, args.difficultyRange, args.limit)
        } else if (command === 'get_question_by_id') {
          return mockMethod(args.questionId)
        } else if (command === 'add_question') {
          return mockMethod(args.question)
        } else if (command === 'update_question') {
          return mockMethod(args.questionId, args.question)
        } else if (command === 'delete_question') {
          return mockMethod(args.questionId)
        } else if (command === 'load_content_pack') {
          return mockMethod(args.packPath)
        } else if (command === 'verify_content_signature') {
          return mockMethod(args.pack)
        } else if (command === 'create_custom_mix') {
          return mockMethod(args.request)
        } else if (command === 'get_custom_mix_by_id') {
          return mockMethod(args.mixId)
        } else if (command === 'get_custom_mixes_by_profile') {
          return mockMethod(args.profileId)
        } else if (command === 'update_custom_mix') {
          return mockMethod(args.mixId, args.updates)
        } else if (command === 'delete_custom_mix') {
          return mockMethod(args.mixId)
        } else if (command === 'get_available_question_count') {
          return mockMethod(args.config)
        } else if (command === 'validate_mix_feasibility') {
          return mockMethod(args.config)
        } else if (command === 'validate_parental_access') {
          return mockMethod(args.challenge, args.input)
        } else if (command === 'validate_parental_feature_access') {
          return mockMethod(args.feature, args.sessionToken)
        } else if (command === 'get_quiz_progress') {
          return mockMethod(args.sessionId)
        } else if (command === 'verify_update_signature') {
          return mockMethod(args.updateData, args.signature)
        } else if (command === 'encrypt_sensitive_data') {
          return mockMethod(args.data)
        } else if (command === 'decrypt_sensitive_data') {
          return mockMethod(args.encryptedData)
        } else if (command === 'verify_content_package') {
          return mockMethod(args.packageData, args.expectedHash)
        } else if (command === 'save_settings') {
          return mockMethod(args.settings)
        } else if (command === 'update_setting') {
          return mockMethod(args.key, args.value)
        } else if (command === 'download_and_install_update') {
          return mockMethod(args.updateInfo)
        }
      }
      return mockMethod(args)
    }
    
    console.warn(`⚠️ Mocked __TAURI_INVOKE__ command not found in mockTauriApi: ${command} (${mockMethodName})`)
    return Promise.resolve()
  }),
  writable: true,
})

// Mock Lottie animations
vi.mock('lottie-react', () => ({
  default: vi.fn(({ animationData, ...props }) => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'lottie-animation',
      ...props
    }, `Lottie Animation: ${animationData?.name || 'Unknown'}`)
  }),
}))

// Mock CSS modules
vi.mock('*.module.css', () => ({
  default: new Proxy({}, {
    get: (target, prop) => prop,
  }),
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
  },
  writable: true,
})
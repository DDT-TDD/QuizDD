import { useEffect } from 'react'
import { AppProvider, useAppContext } from './contexts/AppContext'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import OfflineStatus from './components/OfflineStatus'
import { contentSeeder } from './services/contentSeeder'
import { audioService } from './services/audioService'
import styles from './App.module.css'

// Theme manager component — reads from settings (single source of truth)
function ThemeManager() {
  const { state } = useAppContext()
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme)
  }, [state.settings.theme])

  return null
}

// Loading component — minimal, no debug overlay
function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
      </div>
      <h2 className={styles.loadingText}>Loading QuiZDD...</h2>
    </div>
  )
}

// Error fallback component
function AppErrorFallback() {
  return (
    <div className={styles.errorFallback}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>😔</div>
        <h1>Something went wrong with QuiZDD</h1>
        <p>Please restart the application to continue learning!</p>
        <button 
          className={styles.restartButton}
          onClick={() => window.location.reload()}
        >
          Restart App
        </button>
      </div>
    </div>
  )
}

// Profile picker — shown when multiple profiles exist and none is selected
function ProfilePicker() {
  const { state, dispatch } = useAppContext()

  const handleSelect = (profileId: number) => {
    const profile = state.profiles.find(p => p.id === profileId) ?? null
    dispatch({ type: 'SET_CURRENT_PROFILE', payload: profile })
  }

  return (
    <div className={styles.profilePicker}>
      <div className={styles.profilePickerCard}>
        <div className={styles.profilePickerIcon}>👤</div>
        <h2 className={styles.profilePickerTitle}>Who's playing?</h2>
        <div className={styles.profileList}>
          {state.profiles.map(profile => (
            <button
              key={profile.id}
              className={styles.profileButton}
              onClick={() => handleSelect(profile.id!)}
            >
              <span className={styles.profileAvatar}>{profile.avatar}</span>
              <span className={styles.profileName}>{profile.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main app content
function AppContent() {
  const { state, dispatch } = useAppContext()

  // Initialize app — seed content and load profiles
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: false })

    // Background init after app is visible
    const initTimeout = setTimeout(async () => {
      try {
        const { fixedTauriAPI } = await import('./api/tauri-fixed')

        // Seed only if the database is empty
        try {
          await contentSeeder.seedIfEmpty()
        } catch (seedError) {
          console.warn('Content seeding check failed:', seedError)
        }

        const profiles = await fixedTauriAPI.getAllProfiles()
        dispatch({ type: 'SET_PROFILES', payload: profiles })

        // Auto-select only when exactly one profile exists
        if (profiles.length === 1) {
          dispatch({ type: 'SET_CURRENT_PROFILE', payload: profiles[0] })
        }
        // Multiple profiles → show profile picker (no auto-select)

        // Initialise audio
        try {
          if (audioService.getSettings().backgroundMusicEnabled) {
            audioService.playBackgroundMusic().catch(() => {
              // Autoplay blocked or files missing — not critical
            })
          }
        } catch {
          // Audio is optional
        }
      } catch (error) {
        console.error('Background initialisation failed:', error)
        // Don't surface the error — let the user interact with the app
      }
    }, 100)

    return () => clearTimeout(initTimeout)
  }, [dispatch])

  if (state.isLoading) {
    return <LoadingScreen />
  }

  if (state.error) {
    return (
      <div className={styles.errorFallback}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Oops! Something went wrong</h1>
          <p>{state.error}</p>
          <button 
            className={styles.restartButton}
            onClick={() => window.location.reload()}
          >
            Restart App
          </button>
        </div>
      </div>
    )
  }

  // Profiles loaded but none selected and multiple exist — prompt user
  if (state.profiles.length > 1 && !state.currentProfile) {
    return <ProfilePicker />
  }

  return (
    <div className={styles.app}>
      <ThemeManager />
      {state.error && <OfflineStatus compact={true} />}
      <AppShell />
    </div>
  )
}

// Root App component
function App() {
  return (
    <ErrorBoundary 
      fallback={<AppErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Critical app error:', error, errorInfo)
      }}
    >
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App

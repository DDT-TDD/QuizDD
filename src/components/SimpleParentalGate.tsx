/**
 * SimpleParentalGate
 *
 * Uses the Tauri backend to generate and validate the math challenge,
 * so the answer is never exposed in client-side state.
 * Falls back to a client-side generated problem only when the backend
 * is unavailable (e.g. development / offline).
 */
import React, { useState, useEffect } from 'react';
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed';
import { ParentalChallenge } from '../types/api';
import styles from './ParentalGate.module.css';

interface SimpleParentalGateProps {
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  message?: string;
}

export const SimpleParentalGate: React.FC<SimpleParentalGateProps> = ({
  onSuccess,
  onCancel,
  title = 'Parental Verification',
  message = 'This area requires adult supervision. Solve the maths problem below:',
}) => {
  const [challenge, setChallenge] = useState<ParentalChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  const loadChallenge = async () => {
    try {
      setIsLoading(true);
      const newChallenge = await tauriAPI.generateParentalChallenge();
      setChallenge(newChallenge);
      setUserAnswer('');
      setError('');
    } catch (err) {
      console.error('Failed to generate parental challenge from backend:', err);
      // Fallback — purely numeric so the child cannot infer it from the DOM
      const n1 = Math.floor(Math.random() * 30) + 10;
      const n2 = Math.floor(Math.random() * 30) + 10;
      setChallenge({
        id: 'local-' + Date.now(),
        question: `${n1} + ${n2}`,
        expected_answer: n1 + n2,
        expires_at: Math.floor(Date.now() / 1000) + 300,
      });
      setError('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!challenge || !userAnswer.trim()) {
      setError('Please enter your answer.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const numericAnswer = parseInt(userAnswer.trim(), 10);
      if (isNaN(numericAnswer)) {
        setError('Please enter a valid whole number.');
        setIsLoading(false);
        return;
      }

      // Check expiry
      const now = Math.floor(Date.now() / 1000);
      if (now > challenge.expires_at) {
        setError('The challenge expired. A new one has been generated.');
        await loadChallenge();
        return;
      }

      // Validate through the backend
      let isValid = false;
      if (!challenge.id.startsWith('local-')) {
        // Backend-generated challenge — validate via backend
        isValid = await tauriAPI.validateParentalAccess(challenge.question, userAnswer.trim());
      } else {
        // Fallback challenge — compare locally (no server-side secret was involved)
        isValid = numericAnswer === challenge.expected_answer;
      }

      if (isValid) {
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setError('Too many incorrect attempts. Please try again later.');
          setTimeout(() => onCancel?.(), 3000);
        } else {
          setError(
            `Incorrect. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} remaining.`
          );
          await loadChallenge();
        }
      }
    } catch (err) {
      console.error('Parental gate validation error:', err);
      setError('Verification failed. Please try again.');
      setAttempts(prev => prev + 1);
      if (attempts + 1 >= MAX_ATTEMPTS) {
        setTimeout(() => onCancel?.(), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!challenge) {
    return (
      <div className={styles.parentalGate}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <span className={styles.loadingSpinner}>⏳</span>
            <p>Loading verification...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.parentalGate}>
      <div className={styles.overlay} onClick={onCancel} />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.lockIcon} role="img" aria-label="Lock">🔒</span>
            {title}
          </h2>
          <p className={styles.subtitle}>{message}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.mathProblem}>
            <div className={styles.problemDisplay}>
              <span className={styles.equation}>{challenge.question} = ?</span>
            </div>
            <button
              type="button"
              onClick={loadChallenge}
              className={styles.newProblemButton}
              aria-label="Generate a new maths problem"
              disabled={isLoading}
            >
              🔄 New Problem
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="parentalAnswer" className={styles.label}>
              Your Answer:
            </label>
            <input
              id="parentalAnswer"
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={styles.answerInput}
              placeholder="Enter the answer"
              disabled={isLoading}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !userAnswer.trim()}
            >
              {isLoading ? (
                <><span className={styles.spinner}>⏳</span> Verifying...</>
              ) : (
                'Verify Access'
              )}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            This verification ensures only adults can access content management.
          </p>
          <p className={styles.attemptsInfo}>
            Attempts: {attempts}/{MAX_ATTEMPTS}
          </p>
        </div>
      </div>
    </div>
  );
};

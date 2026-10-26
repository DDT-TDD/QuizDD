import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'

/**
 * Content Seeder Service
 *
 * Thin wrapper around the Tauri backend seeding commands.
 * All question data is stored and managed in Rust/SQLite — this service
 * just calls the appropriate IPC commands.
 *
 * The old per-subject JS seeder methods have been removed: they had a
 * `correct_answer` type inconsistency (plain string vs `{ Text: "..." }`)
 * and were never called in the live path. Seeding is handled entirely by
 * the Rust `seed_all_content` command.
 */
export class ContentSeeder {

  /**
   * Seed the database with the full built-in educational content set.
   * Calls the Rust backend which handles deduplication.
   */
  async seedAllContent(): Promise<void> {
    await tauriAPI.seedAllContent()
  }

  /**
   * Check if content has already been seeded.
   */
  async isContentSeeded(): Promise<boolean> {
    try {
      return await tauriAPI.isContentSeeded()
    } catch (error) {
      console.error('Failed to check if content is seeded:', error)
      return false
    }
  }

  /**
   * Seed content only if the database is currently empty.
   * Called on startup — safe to call every time.
   */
  async seedIfEmpty(): Promise<void> {
    await tauriAPI.seedIfEmpty()
  }
}

// Singleton instance
export const contentSeeder = new ContentSeeder()

export default contentSeeder

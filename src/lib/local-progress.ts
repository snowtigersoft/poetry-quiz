// Client-side utility for managing local (guest) progress
// Uses localStorage for simple state and IndexedDB (via Dexie) for structured data

export const ANONYMOUS_ID_KEY = "quiz_anonymous_id"

export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(ANONYMOUS_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(ANONYMOUS_ID_KEY, id)
  }
  return id
}

export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ANONYMOUS_ID_KEY)
}

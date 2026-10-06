// Centralized access-token storage so "Remember me" can pick the right backend.
//
// localStorage  → persists across browser restarts (Remember me checked)
// sessionStorage → cleared when the tab/window closes (Remember me unchecked)
//
// Reads check both stores so callers don't need to know which one was used at
// login time. Writes always clear the other store first to keep a single
// source of truth and avoid stale tokens lingering after a re-login.

const TOKEN_KEY = "access_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, persist: boolean): void {
  if (typeof window === "undefined") return
  if (persist) {
    localStorage.setItem(TOKEN_KEY, token)
    sessionStorage.removeItem(TOKEN_KEY)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

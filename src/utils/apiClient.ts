const ACTIVE_PROJECT_STORAGE_KEY = 'activeProject'

const getStoredActiveProject = (): string => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY) ?? ''
}

const isSameOriginRequest = (input: RequestInfo | URL): boolean => {
  if (typeof window === 'undefined') return false

  const resolvedURL =
    typeof input === 'string'
      ? new URL(input, window.location.origin)
      : input instanceof URL
        ? input
        : new URL(input.url, window.location.origin)

  return resolvedURL.origin === window.location.origin
}

const withProjectHeader = (input: RequestInfo | URL, init?: RequestInit): RequestInit => {
  const activeProjectId = getStoredActiveProject()
  if (!activeProjectId) return init ?? {}

  const headers = new Headers(init?.headers)
  headers.set('x-project-id', activeProjectId)

  return {
    ...init,
    headers,
  }
}

export const installProjectHeaderInterceptor = (): (() => void) => {
  if (typeof window === 'undefined') return () => {}

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!isSameOriginRequest(input)) {
      return originalFetch(input, init)
    }

    return originalFetch(input, withProjectHeader(input, init))
  }

  return () => {
    window.fetch = originalFetch
  }
}

export const setActiveProject = (projectId: string): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, projectId)
}

export const getActiveProjectFromStorage = (): string => {
  return getStoredActiveProject()
}

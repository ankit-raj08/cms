import type { PayloadRequest } from 'payload'

type IDLike = string | number

type ProjectRole = {
  project?: IDLike | { id?: IDLike | null } | null
}

type AccessUser = {
  globalRole?: string | null
  projectRoles?: ProjectRole[] | null
}

const normalizeId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const nestedId = (value as { id?: unknown }).id
    if (typeof nestedId === 'string' || typeof nestedId === 'number') return String(nestedId)
  }
  return null
}

export const getUserProjectIds = (user: AccessUser | null | undefined): string[] => {
  if (!user?.projectRoles?.length) return []

  const projectIds = user.projectRoles
    .map((item) => normalizeId(item?.project))
    .filter((projectId): projectId is string => Boolean(projectId))

  return [...new Set(projectIds)]
}

export const getUserProjects = async (
  user: AccessUser | null | undefined,
  req?: PayloadRequest,
): Promise<string[]> => {
  if (!user) return []

  if (user.globalRole === 'super_admin') {
    if (!req) return []

    try {
      const projects = await req.payload.find({
        collection: 'projects',
        limit: 1000,
        pagination: false,
        req,
      })

      return projects.docs
        .map((doc) => normalizeId((doc as { id?: unknown }).id))
        .filter((projectId): projectId is string => Boolean(projectId))
    } catch {
      return []
    }
  }

  return getUserProjectIds(user)
}

export const hasProjectAccess = (
  user: AccessUser | null | undefined,
  projectId: unknown,
): boolean => {
  if (!user) return false
  if (user.globalRole === 'super_admin') return true

  const normalizedProjectId = normalizeId(projectId)
  if (!normalizedProjectId) return false

  return getUserProjectIds(user).includes(normalizedProjectId)
}

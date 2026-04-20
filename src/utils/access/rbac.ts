import type {
  Access,
  ClientUser,
  CollectionBeforeChangeHook,
  FieldAccess,
  PayloadRequest,
  Where,
} from 'payload'

import { getUserProjects, hasProjectAccess } from './hasProjectAccess'
import { hasAnyPermission, hasPermission, type AccessUser } from './hasPermission'

type UserWithRBAC = AccessUser

type CreateData = {
  project?: unknown
}

type ProjectAccessEntry = {
  allowedPages?: unknown[] | unknown
}

const denyWhere: Where = { id: { equals: '__deny__' } }

const normalizeId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const nestedId = (value as { id?: unknown }).id
    if (typeof nestedId === 'string' || typeof nestedId === 'number') return String(nestedId)
  }
  return null
}

const toProjectScopedWhere = (projectIds: string[], projectField: string): Where => {
  if (!projectIds.length) return denyWhere
  return {
    [projectField]: {
      in: projectIds,
    },
  }
}

const ensureProjectAccess = (user: UserWithRBAC): void => {
  if (!Array.isArray(user.projectAccess) || user.projectAccess.length === 0) {
    throw new Error('Access denied: user projectAccess is not configured.')
  }
}

const getUserAllowedPageIds = (user: UserWithRBAC | null | undefined): string[] => {
  const projectAccess = (user as { projectAccess?: ProjectAccessEntry[] | null } | undefined)
    ?.projectAccess
  if (!projectAccess?.length) return []

  const allowedPageIds = projectAccess.flatMap((entry) => {
    const allowedPages = entry.allowedPages
    const pageValues = Array.isArray(allowedPages) ? allowedPages : [allowedPages]

    return pageValues
      .map((pageValue) => normalizeId(pageValue))
      .filter((pageId): pageId is string => Boolean(pageId))
  })

  return [...new Set(allowedPageIds)]
}

const getPermittedProjectIds = async (
  req: PayloadRequest,
  resource: string,
  action: string,
): Promise<string[]> => {
  const user = req.user as UserWithRBAC | undefined
  if (!user) return []
  if (user.globalRole === 'super_admin') return []

  const projectIds = await getUserProjects(user, req)
  if (!projectIds.length) return []

  const checks = await Promise.all(
    projectIds.map(async (projectId) => {
      const allowed = await hasPermission(user, projectId, resource, action, req)
      return allowed ? projectId : null
    }),
  )

  return checks.filter((projectId): projectId is string => Boolean(projectId))
}

export const buildProjectScopedReadAccess = (
  resource: string,
  projectField: string,
): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true
    ensureProjectAccess(user)

    const allowedProjectIds = await getPermittedProjectIds(req, resource, 'read')
    if (!allowedProjectIds.length) {
      return true
    }

    return toProjectScopedWhere(allowedProjectIds, projectField)
  }
}

export const buildActiveProjectReadAccess = (): Access => {
  return ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true

    const activeProject =
      req.headers.get('x-project-id') ??
      (req.headers as unknown as Record<string, string | undefined>)['x-project-id']

    // Allow admin and first-load screens to render before a project is selected.
    if (!activeProject) return true

    return {
      project: {
        equals: activeProject,
      },
    }
  }
}

export const buildProjectMembershipReadAccess = (projectField: string): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true
    ensureProjectAccess(user)

    const projectIds = await getUserProjects(user, req)
    if (!projectIds.length) {
      return true
    }
    return toProjectScopedWhere(projectIds, projectField)
  }
}

export const buildProjectScopedCreateAccess = (resource: string): Access => {
  return buildProjectScopedCreateAccessWithAction(resource, 'create')
}

export const buildAssignedProjectCreateAccess = (): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true
    ensureProjectAccess(user)

    const projectIds = await getUserProjects(user, req)
    return projectIds.length > 0
  }
}

export const buildProjectScopedCreateAccessWithAction = (
  resource: string,
  action: string,
): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true
    ensureProjectAccess(user)

    const allowedProjectIds = await getPermittedProjectIds(req, resource, action)
    return allowedProjectIds.length > 0
  }
}

export const buildProjectScopedUpdateDeleteAccess = (
  resource: string,
  action: 'update' | 'delete',
  projectField: string,
): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true
    ensureProjectAccess(user)

    const allowedProjectIds = await getPermittedProjectIds(req, resource, action)
    return toProjectScopedWhere(allowedProjectIds, projectField)
  }
}

export const buildAllowedPagesReadAccess = (): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true
    ensureProjectAccess(user)

    const allowedPageIds = getUserAllowedPageIds(user)
    if (allowedPageIds.length) {
      return {
        id: {
          in: allowedPageIds,
        },
      }
    }

    const projectIds = await getUserProjects(user, req)
    if (projectIds.length) {
      return toProjectScopedWhere(projectIds, 'project')
    }

    return true
  }
}

export const buildAllowedPagesUpdateAccess = (): Access => {
  return ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true

    const allowedPageIds = getUserAllowedPageIds(user)
    if (!allowedPageIds.length) return denyWhere

    return {
      id: {
        in: allowedPageIds,
      },
    }
  }
}

export const buildAllowedPagesScopedUpdateAccess = (
  resource: string,
  action: string,
  projectField: string,
): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true
    ensureProjectAccess(user)

    const allowedPageIds = getUserAllowedPageIds(user)
    if (!allowedPageIds.length) return denyWhere

    const allowedProjectIds = await getPermittedProjectIds(req, resource, action)
    if (!allowedProjectIds.length) return denyWhere

    return {
      and: [
        {
          id: {
            in: allowedPageIds,
          },
        },
        {
          [projectField]: {
            in: allowedProjectIds,
          },
        },
      ],
    }
  }
}

export const superAdminOnlyAccess: Access = ({ req }) => {
  return req.user?.globalRole === 'super_admin'
}

export const hideCollectionWithoutReadPermission = (
  resource: string,
): ((args: { user: ClientUser }) => boolean) => {
  const hidden: (args: { user: ClientUser }) => boolean = ({ user }) => {
    return !hasAnyPermission(user as UserWithRBAC, resource, 'read')
  }
  return hidden
}

export const showProjectFieldInAdmin = (
  _data: unknown,
  _siblingData: unknown,
  { user }: { user: unknown },
): boolean => {
  if (!user) return false
  if ((user as { globalRole?: string }).globalRole === 'super_admin') return true

  const projectAccess = (user as { projectAccess?: unknown[] }).projectAccess
  return Array.isArray(projectAccess) && projectAccess.length > 1
}

export const enforceProjectAccessOnCreate = (
  _resource: string,
  _action = 'create',
): CollectionBeforeChangeHook => {
  return async ({ req, data, originalDoc }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) throw new Error('Authentication required.')
    if (user.globalRole === 'super_admin') return data

    const createData = (data ?? {}) as CreateData
    const userProjects = await getUserProjects(user, req)
    if (!userProjects.length) {
      throw new Error('No assigned projects.')
    }

    const existingProjectId = (originalDoc as { project?: unknown } | undefined)?.project
    const projectId = createData.project ?? existingProjectId

    if (!projectId) {
      throw new Error('Project is required.')
    }

    const hasMembership = hasProjectAccess(user, projectId)
    if (!hasMembership) {
      throw new Error('You do not have access to this project.')
    }

    return createData
  }
}

const resolveProjectFromFieldArgs = (args: {
  data?: unknown
  siblingData?: unknown
  doc?: unknown
  req: PayloadRequest
}): unknown => {
  const siblingDataProject = (args.siblingData as { project?: unknown } | undefined)?.project
  if (siblingDataProject) return siblingDataProject

  const dataProject = (args.data as { project?: unknown } | undefined)?.project
  if (dataProject) return dataProject

  const docProject = (args.doc as { project?: unknown } | undefined)?.project
  if (docProject) return docProject

  return (args.req as { data?: { project?: unknown } }).data?.project
}

export const buildFieldUpdateAccess = (
  resource: string,
  action: string,
): FieldAccess => {
  return async ({ req, data, siblingData, doc }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true

    const project = resolveProjectFromFieldArgs({ req, data, siblingData, doc })
    const projectId = normalizeId(project)
    if (!projectId) return false

    return hasPermission(user, projectId, resource, action, req)
  }
}

export const superAdminOnlyFieldUpdate: FieldAccess = ({ req }) => {
  return req.user?.globalRole === 'super_admin'
}

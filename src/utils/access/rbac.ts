import type {
  Access,
  BeforeChangeHook,
  FieldAccess,
  PayloadRequest,
  Where,
} from 'payload'

import { getUserProjects, hasProjectAccess } from './hasProjectAccess'
import { hasAnyPermission, hasPermission } from './hasPermission'

type UserWithRBAC = {
  globalRole?: string | null
  projectRoles?: unknown[] | null
}

type CreateData = {
  project?: unknown
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

    const allowedProjectIds = await getPermittedProjectIds(req, resource, 'read')
    return toProjectScopedWhere(allowedProjectIds, projectField)
  }
}

export const buildProjectScopedCreateAccess = (resource: string): Access => {
  return buildProjectScopedCreateAccessWithAction(resource, 'create')
}

export const buildProjectScopedCreateAccessWithAction = (
  resource: string,
  action: string,
): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true

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

    const allowedProjectIds = await getPermittedProjectIds(req, resource, action)
    return toProjectScopedWhere(allowedProjectIds, projectField)
  }
}

export const buildProjectMembershipReadAccess = (): Access => {
  return async ({ req }) => {
    const user = req.user as UserWithRBAC | undefined
    if (!user) return false
    if (user.globalRole === 'super_admin') return true

    const projectIds = await getUserProjects(user, req)
    return toProjectScopedWhere(projectIds, 'id')
  }
}

export const superAdminOnlyAccess: Access = ({ req }) => {
  return req.user?.globalRole === 'super_admin'
}

export const hideCollectionWithoutProjectMembership = ({
  user,
}: {
  user?: UserWithRBAC
}): boolean => {
  if (!user) return true
  if (user.globalRole === 'super_admin') return false
  return !user.projectRoles?.length
}

export const hideCollectionWithoutReadPermission = (
  resource: string,
): ((args: { user?: UserWithRBAC }) => boolean) => {
  return ({ user }) => {
    return !hasAnyPermission(user, resource, 'read')
  }
}

export const enforceProjectAccessOnCreate = (
  resource: string,
  action = 'create',
): BeforeChangeHook => {
  return async ({ operation, req, data }) => {
    if (operation !== 'create') return data

    const user = req.user as UserWithRBAC | undefined
    if (!user) throw new Error('Authentication required.')
    if (user.globalRole === 'super_admin') return data

    const createData = (data ?? {}) as CreateData
    const userProjects = await getUserProjects(user, req)
    if (!userProjects.length) {
      throw new Error('No assigned projects.')
    }

    if (!createData.project && userProjects.length === 1) {
      createData.project = userProjects[0]
    }

    const projectId = createData.project

    if (!projectId) {
      throw new Error('Project is required.')
    }

    const hasMembership = hasProjectAccess(user, projectId)
    if (!hasMembership) {
      throw new Error('You do not have access to this project.')
    }

    const canCreate = await hasPermission(user, projectId, resource, action, req)
    if (!canCreate) {
      throw new Error(`You do not have ${resource} ${action} permission for this project.`)
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

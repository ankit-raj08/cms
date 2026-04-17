import type { PayloadRequest } from 'payload'

import { hasProjectAccess } from './hasProjectAccess'

type IDLike = string | number

type PermissionActionMap = Record<string, boolean | null | undefined>

type StructuredPermissions = {
  content?: PermissionActionMap | null
  contentTypes?: PermissionActionMap | null
  media?: PermissionActionMap | null
  projects?: PermissionActionMap | null
}

type RoleValue =
  | IDLike
  | {
      id?: IDLike | null
      permissions?: StructuredPermissions | null
    }
  | null

type ProjectRole = {
  project?: IDLike | { id?: IDLike | null } | null
  role?: RoleValue
}

type AccessUser = {
  globalRole?: string | null
  projectRoles?: ProjectRole[] | null
}

const resolveRolePermissionsSync = (role: RoleValue): StructuredPermissions | null => {
  if (!role || typeof role !== 'object') return null
  if (!role.permissions || typeof role.permissions !== 'object') return null
  return role.permissions
}

const normalizeId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const nestedId = (value as { id?: unknown }).id
    if (typeof nestedId === 'string' || typeof nestedId === 'number') return String(nestedId)
  }
  return null
}

const resolveRolePermissions = async (
  role: RoleValue,
  req?: PayloadRequest,
): Promise<StructuredPermissions | null> => {
  if (!role) return null

  if (typeof role === 'object' && role.permissions && typeof role.permissions === 'object') {
    return role.permissions
  }

  const roleId = normalizeId(role)
  if (!roleId || !req) return null

  try {
    const roleDoc = await req.payload.findByID({
      collection: 'roles',
      id: roleId,
      req,
    })

    const permissions = (roleDoc as { permissions?: unknown }).permissions
    return permissions && typeof permissions === 'object'
      ? (permissions as StructuredPermissions)
      : null
  } catch {
    return null
  }
}

export const hasPermission = async (
  user: AccessUser | null | undefined,
  projectId: unknown,
  resource: string,
  action: string,
  req?: PayloadRequest,
): Promise<boolean> => {
  if (!user) return false
  if (user.globalRole === 'super_admin') return true
  if (!hasProjectAccess(user, projectId)) return false

  const normalizedProjectId = normalizeId(projectId)
  if (!normalizedProjectId || !user.projectRoles?.length) return false

  const matchingProjectRole = user.projectRoles.find((projectRole) => {
    return normalizeId(projectRole?.project) === normalizedProjectId
  })

  if (!matchingProjectRole) return false

  const permissions = await resolveRolePermissions(matchingProjectRole.role ?? null, req)
  if (!permissions) return false

  const resourcePermissions = permissions[resource as keyof StructuredPermissions]
  if (!resourcePermissions || typeof resourcePermissions !== 'object') return false

  return resourcePermissions[action] === true
}

export const hasAnyPermission = (
  user: AccessUser | null | undefined,
  resource: string,
  action: string,
): boolean => {
  if (!user) return false
  if (user.globalRole === 'super_admin') return true
  if (!user.projectRoles?.length) return false

  return user.projectRoles.some((projectRole) => {
    const permissions = resolveRolePermissionsSync(projectRole.role ?? null)
    if (!permissions) return false

    const resourcePermissions = permissions[resource as keyof StructuredPermissions]
    if (!resourcePermissions || typeof resourcePermissions !== 'object') return false

    return resourcePermissions[action] === true
  })
}

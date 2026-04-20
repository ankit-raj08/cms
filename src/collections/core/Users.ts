import type { CollectionConfig } from 'payload'

const normalizeRelationshipId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'globalRole',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        {
          label: 'Super Admin',
          value: 'super_admin',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      name: 'projectAccess',
      type: 'array',
      validate: (rows) => {
        if (!Array.isArray(rows)) return true

        const seenProjects = new Set<string>()

        for (const row of rows) {
          const projectId = normalizeRelationshipId((row as { project?: unknown })?.project)
          if (!projectId) continue

          if (seenProjects.has(projectId)) {
            return 'Each project can be assigned only once per user.'
          }
          seenProjects.add(projectId)
        }

        return true
      },
      fields: [
        {
          name: 'project',
          type: 'relationship',
          relationTo: 'projects',
          required: true,
        },
        {
          name: 'role',
          type: 'relationship',
          relationTo: 'roles',
          required: true,
        },
        {
          name: 'allowedPages',
          type: 'relationship',
          relationTo: 'pages',
          hasMany: true,
        },
      ],
    },
  ],
}

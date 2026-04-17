import type { CollectionConfig } from 'payload'

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
      name: 'projectRoles',
      type: 'array',
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
      ],
    },
  ],
}

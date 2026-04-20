import type { CollectionConfig } from 'payload'

export const Roles: CollectionConfig = {
  slug: 'roles',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'permissions',
      type: 'group',
      fields: [
        {
          name: 'pages',
          type: 'group',
          fields: [
            { name: 'read', type: 'checkbox' },
            { name: 'update', type: 'checkbox' },
            { name: 'publish', type: 'checkbox' },
          ],
        },
        {
          name: 'blogs',
          type: 'group',
          fields: [
            { name: 'read', type: 'checkbox' },
            { name: 'create', type: 'checkbox' },
            { name: 'update', type: 'checkbox' },
            { name: 'delete', type: 'checkbox' },
          ],
        },
        {
          name: 'media',
          type: 'group',
          fields: [
            { name: 'read', type: 'checkbox' },
            { name: 'upload', type: 'checkbox' },
            { name: 'delete', type: 'checkbox' },
          ],
        },
      ],
    },
  ],
}

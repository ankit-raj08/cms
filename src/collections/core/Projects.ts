import type { CollectionConfig } from 'payload'
import {
  buildProjectScopedReadAccess,
  hideCollectionWithoutReadPermission,
  superAdminOnlyAccess,
  superAdminOnlyFieldUpdate,
} from '@/utils/access/rbac'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    hidden: hideCollectionWithoutReadPermission('projects'),
  },
  access: {
    read: buildProjectScopedReadAccess('projects', 'id'),
    create: superAdminOnlyAccess,
    update: superAdminOnlyAccess,
    delete: superAdminOnlyAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      access: {
        update: superAdminOnlyFieldUpdate,
      },
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
}

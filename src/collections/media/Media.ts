import type { CollectionConfig } from 'payload'
import {
  buildProjectScopedCreateAccessWithAction,
  buildProjectScopedReadAccess,
  buildProjectScopedUpdateDeleteAccess,
  enforceProjectAccessOnCreate,
  hideCollectionWithoutReadPermission,
} from '@/utils/access/rbac'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: hideCollectionWithoutReadPermission('media'),
  },
  access: {
    read: buildProjectScopedReadAccess('media', 'project'),
    create: buildProjectScopedCreateAccessWithAction('media', 'upload'),
    update: buildProjectScopedUpdateDeleteAccess('media', 'update', 'project'),
    delete: buildProjectScopedUpdateDeleteAccess('media', 'delete', 'project'),
  },
  hooks: {
    beforeChange: [enforceProjectAccessOnCreate('media', 'upload')],
  },
  upload: {
    staticDir: 'media',
    staticURL: '/media',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
  ],
}

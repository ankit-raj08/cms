import type { CollectionConfig } from 'payload'
import {
  buildActiveProjectReadAccess,
  buildFieldUpdateAccess,
  buildProjectScopedCreateAccessWithAction,
  buildProjectScopedUpdateDeleteAccess,
  enforceProjectAccessOnCreate,
  hideCollectionWithoutReadPermission,
} from '@/utils/access/rbac'
import { attachProject } from '@/hooks/attachProject'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: hideCollectionWithoutReadPermission('media'),
  },
  access: {
    read: buildActiveProjectReadAccess(),
    create: buildProjectScopedCreateAccessWithAction('media', 'upload'),
    update: buildProjectScopedUpdateDeleteAccess('media', 'update', 'project'),
    delete: buildProjectScopedUpdateDeleteAccess('media', 'delete', 'project'),
  },
  hooks: {
    beforeChange: [attachProject, enforceProjectAccessOnCreate('media', 'upload')],
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
      access: {
        update: buildFieldUpdateAccess('media', 'upload'),
      },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
    },
  ],
}

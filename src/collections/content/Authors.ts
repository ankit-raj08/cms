import type { CollectionConfig } from 'payload'

import {
  buildProjectScopedCreateAccess,
  buildProjectScopedReadAccess,
  buildProjectScopedUpdateDeleteAccess,
  enforceProjectAccessOnCreate,
  hideCollectionWithoutReadPermission,
} from '@/utils/access/rbac'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    hidden: hideCollectionWithoutReadPermission('content'),
  },
  access: {
    read: buildProjectScopedReadAccess('content', 'project'),
    create: buildProjectScopedCreateAccess('content'),
    update: buildProjectScopedUpdateDeleteAccess('content', 'update', 'project'),
    delete: buildProjectScopedUpdateDeleteAccess('content', 'delete', 'project'),
  },
  hooks: {
    beforeChange: [enforceProjectAccessOnCreate('content')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
  ],
}

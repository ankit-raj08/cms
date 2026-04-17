import type { CollectionConfig } from 'payload'

import {
  buildProjectScopedCreateAccess,
  buildProjectScopedReadAccess,
  buildProjectScopedUpdateDeleteAccess,
  enforceProjectAccessOnCreate,
  hideCollectionWithoutReadPermission,
} from '@/utils/access/rbac'

export const Categories: CollectionConfig = {
  slug: 'categories',
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
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
  ],
}

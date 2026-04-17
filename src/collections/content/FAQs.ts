import type { CollectionConfig } from 'payload'

import {
  buildProjectScopedCreateAccess,
  buildProjectScopedReadAccess,
  buildProjectScopedUpdateDeleteAccess,
  enforceProjectAccessOnCreate,
  hideCollectionWithoutReadPermission,
} from '@/utils/access/rbac'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
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
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
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

import type { CollectionConfig } from 'payload'

import { CTABlock, CardListBlock, HeroBlock, ImageBlock, TextBlock } from '@/blocks'
import {
  buildProjectScopedCreateAccess,
  buildProjectScopedReadAccess,
  buildProjectScopedUpdateDeleteAccess,
  enforceProjectAccessOnCreate,
  hideCollectionWithoutReadPermission,
} from '@/utils/access/rbac'

export const Pages: CollectionConfig = {
  slug: 'pages',
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
      name: 'title',
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
    {
      name: 'sections',
      type: 'blocks',
      blocks: [HeroBlock, TextBlock, ImageBlock, CardListBlock, CTABlock],
    },
  ],
}

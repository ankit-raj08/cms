import type { CollectionConfig } from 'payload'

import {
  BlogListBlock,
  BulletSection,
  FAQSection,
  HeroBlock,
  QuoteSection,
  TextSection,
} from '@/blocks'
import {
  buildActiveProjectReadAccess,
  buildAllowedPagesScopedUpdateAccess,
  buildFieldUpdateAccess,
  buildProjectScopedUpdateDeleteAccess,
  enforceProjectAccessOnCreate,
  hideCollectionWithoutReadPermission,
} from '@/utils/access/rbac'
import { attachProject } from '@/hooks/attachProject'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    hidden: hideCollectionWithoutReadPermission('pages'),
    useAsTitle: 'title',
  },
  access: {
    read: buildActiveProjectReadAccess(),
    create: () => true,
    update: buildAllowedPagesScopedUpdateAccess('pages', 'update', 'project'),
    delete: buildProjectScopedUpdateDeleteAccess('content', 'delete', 'project'),
  },
  hooks: {
    beforeChange: [attachProject, enforceProjectAccessOnCreate('content')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      access: {
        update: buildFieldUpdateAccess('pages', 'update'),
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      access: {
        update: buildFieldUpdateAccess('pages', 'update'),
      },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: [
        HeroBlock,
        BlogListBlock,
        FAQSection,
        TextSection,
        BulletSection,
        QuoteSection,
      ],
      admin: {
        description: 'Drag and drop sections to control page layout order.',
        initCollapsed: false,
      },
      access: {
        update: buildFieldUpdateAccess('pages', 'update'),
      },
    },
  ],
}

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

const BlogTextBlock = {
  slug: 'text',
  fields: [
    {
      name: 'content',
      type: 'textarea' as const,
    },
  ],
}

const BlogImageBlock = {
  slug: 'image',
  fields: [
    {
      name: 'image',
      type: 'relationship' as const,
      relationTo: 'media' as const,
    },
    {
      name: 'alt',
      type: 'text' as const,
    },
  ],
}

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    hidden: hideCollectionWithoutReadPermission('blogs'),
  },
  access: {
    read: buildActiveProjectReadAccess(),
    create: buildProjectScopedCreateAccessWithAction('blogs', 'create'),
    update: buildProjectScopedUpdateDeleteAccess('blogs', 'update', 'project'),
    delete: buildProjectScopedUpdateDeleteAccess('blogs', 'delete', 'project'),
  },
  hooks: {
    beforeChange: [attachProject, enforceProjectAccessOnCreate('blogs')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      access: {
        update: buildFieldUpdateAccess('blogs', 'update'),
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      access: {
        update: buildFieldUpdateAccess('blogs', 'update'),
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
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media',
      access: {
        update: buildFieldUpdateAccess('blogs', 'update'),
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      access: {
        update: buildFieldUpdateAccess('blogs', 'update'),
      },
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [BlogTextBlock, BlogImageBlock],
      access: {
        update: buildFieldUpdateAccess('blogs', 'update'),
      },
    },
    {
      name: 'tags',
      type: 'array',
      access: {
        update: buildFieldUpdateAccess('blogs', 'update'),
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      access: {
        update: buildFieldUpdateAccess('blogs', 'update'),
      },
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      access: {
        update: buildFieldUpdateAccess('blogs', 'update'),
      },
    },
  ],
}

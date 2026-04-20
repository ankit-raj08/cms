import type { Block } from 'payload'

export const BlogListBlock: Block = {
  slug: 'blog-list',
  fields: [
    {
      name: 'order',
      type: 'number',
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'limit',
      type: 'number',
    },
    {
      name: 'filters',
      type: 'group',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
  ],
}

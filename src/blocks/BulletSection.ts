import type { Block } from 'payload'

export const BulletSection: Block = {
  slug: 'bullet-section',
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
      name: 'points',
      type: 'array',
      fields: [
        {
          name: 'point',
          type: 'text',
        },
      ],
    },
  ],
}

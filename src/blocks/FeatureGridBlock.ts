import type { Block } from 'payload'

export const FeatureGridBlock: Block = {
  slug: 'feature-grid',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
  ],
}

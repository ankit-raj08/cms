import type { Block } from 'payload'

export const CardListBlock: Block = {
  slug: 'card-list',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
        },
      ],
    },
  ],
}

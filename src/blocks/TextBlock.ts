import type { Block } from 'payload'

export const TextBlock: Block = {
  slug: 'text',
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],
}

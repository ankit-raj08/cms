import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  fields: [
    {
      name: 'order',
      type: 'number',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'buttonText',
      type: 'text',
      required: true,
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: true,
    },
  ],
}

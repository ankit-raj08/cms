import type { Block } from 'payload'

export const TextSection: Block = {
  slug: 'text-section',
  fields: [
    {
      name: 'order',
      type: 'number',
    },
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'headingType',
      type: 'select',
      defaultValue: 'h2',
      options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}

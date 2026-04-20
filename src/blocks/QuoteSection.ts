import type { Block } from 'payload'

export const QuoteSection: Block = {
  slug: 'quote-section',
  fields: [
    {
      name: 'order',
      type: 'number',
    },
    {
      name: 'quote',
      type: 'text',
    },
    {
      name: 'author',
      type: 'text',
    },
  ],
}

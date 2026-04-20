import type { Block } from 'payload'

export const FAQSection: Block = {
  slug: 'faq-section',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'limit',
      type: 'number',
    },
  ],
}

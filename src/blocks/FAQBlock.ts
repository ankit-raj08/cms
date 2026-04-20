import type { Block } from 'payload'

export const FAQBlock: Block = {
  slug: 'faq',
  fields: [
    {
      name: 'order',
      type: 'number',
    },
    {
      name: 'faqItems',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
    },
  ],
}

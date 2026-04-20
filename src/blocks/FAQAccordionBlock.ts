import type { Block } from 'payload'

export const FAQAccordionBlock: Block = {
  slug: 'faq-accordion',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'faqItems',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
    },
  ],
}

import type { Block } from 'payload'

export const ImageGalleryBlock: Block = {
  slug: 'image-gallery',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'images',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
  ],
}

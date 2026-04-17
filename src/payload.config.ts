import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/core/Users'
import { Roles } from './collections/core/Roles'
import { Projects } from './collections/core/Projects'
import { Pages } from './collections/content/Pages'
import { Posts } from './collections/content/Posts'
import { Categories } from './collections/content/Categories'
import { Authors } from './collections/content/Authors'
import { FAQs } from './collections/content/FAQs'
import { Testimonials } from './collections/content/Testimonials'
import { Media } from './collections/media/Media'
import { Navigation } from './globals/Navigation'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Roles, Projects, Media, Pages, Posts, Categories, Authors, FAQs, Testimonials],
  globals: [Navigation, Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})

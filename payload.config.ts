import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Pages } from './src/collections/Pages'
import { FAQs } from './src/collections/FAQs'
import { Services } from './src/collections/Services'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: '@/components/payload/CustomPayloadNav#CustomPayloadNav',
      graphics: {
        Logo: '@/components/payload/CustomAdminLogo#CustomAdminLogo',
        Icon: '@/components/payload/CustomAdminIcon#CustomAdminIcon',
      },
    },
  },
  collections: [Users, Media, Pages, FAQs, Services],
  editor: lexicalEditor(),
  secret:
    process.env.PAYLOAD_SECRET ||
    'smartfonedoctor-philadelphia-payload-secret-key-32chars',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.POSTGRES_URL ||
        process.env.DATABASE_URI ||
        'postgresql://postgres:postgres@127.0.0.1:5432/smartfonedoctor',
    },
  }),
})


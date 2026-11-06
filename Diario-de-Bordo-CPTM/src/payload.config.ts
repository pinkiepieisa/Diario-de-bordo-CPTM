// Substitui src/payload.config.ts (versão self-hosted, sem @payloadcms/figma)
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { pt as adminLanguage } from '@payloadcms/translations/languages/pt'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    migrationDir: path.resolve(dirname, 'migrations'),
    // O schema é sempre criado por migrations (pnpm payload migrate), em dev e produção.
    push: false,
  }),
  editor: lexicalEditor(),
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: {
    fallbackLanguage: 'pt',
    supportedLanguages: { pt: adminLanguage },
  },
  collections: [Admins, Users],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  // Cria o 1º administrador a partir das variáveis ADMIN_EMAIL / ADMIN_PASSWORD.
  // Em repositório público isso evita que um desconhecido acesse /admin primeiro
  // e crie o admin pela tela "primeiro usuário". Só age se não existir nenhum admin.
  onInit: async (payload) => {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    if (!email || !password) return
    try {
      const { totalDocs } = await payload.count({ collection: 'admins' })
      if (totalDocs > 0) return
      await payload.create({ collection: 'admins', data: { email, password } })
      payload.logger.info('Administrador inicial criado.')
    } catch (err) {
      // Normal no build ou antes das migrations rodarem (tabela ainda não existe).
      payload.logger.warn('Admin inicial não criado nesta inicialização.')
    }
  },
})

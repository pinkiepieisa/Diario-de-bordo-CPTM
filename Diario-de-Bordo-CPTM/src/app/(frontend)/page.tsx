import DiarioApp from '@/components/DiarioApp'
import { appAuth } from '@/lib/app-auth'

export default async function HomePage() {
  const user = await appAuth.getCurrentUser()
  const initialUser = user
    ? {
        id: user.id,
        email: user.email,
        matricula: user.username,
        name: user.name,
      }
    : null

  return <DiarioApp initialUser={initialUser} />
}

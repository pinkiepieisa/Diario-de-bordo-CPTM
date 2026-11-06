import 'server-only'

import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

const APP_SESSION_COOKIE = 'app-session'
const APP_USER_COLLECTION = 'users' as const

export interface AuthenticatedAppUser {
  id: string | number
  email: string
  name: string
  username: string
}

function sessionCookieOptions(exp?: number) {
  return {
    expires: exp ? new Date(exp * 1000) : undefined,
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }
}

export function createAppAuth() {
  return {
    async getCurrentUser(): Promise<AuthenticatedAppUser | null> {
      const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
      if (!token) return null

      const payload = await getPayload({ config })
      const authHeaders = new Headers({ Authorization: `JWT ${token}` })
      const { user } = await payload.auth({ headers: authHeaders })

      if (!user || user.collection !== APP_USER_COLLECTION) return null

      return user as AuthenticatedAppUser
    },

    async login(username: string, password: string): Promise<AuthenticatedAppUser> {
      const payload = await getPayload({ config })
      const result = await payload.login({
        collection: APP_USER_COLLECTION,
        data: { password, username },
        overrideAccess: false,
      })

      if (!result.token || !result.user) {
        throw new Error('INVALID_CREDENTIALS')
      }

      ;(await cookies()).set(APP_SESSION_COOKIE, result.token, sessionCookieOptions(result.exp))

      return result.user as AuthenticatedAppUser
    },

    async logout(): Promise<void> {
      ;(await cookies()).delete(APP_SESSION_COOKIE)
    },
  }
}

export const appAuth = createAppAuth()

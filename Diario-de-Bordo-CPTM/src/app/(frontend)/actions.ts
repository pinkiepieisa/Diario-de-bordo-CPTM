'use server'

import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'

interface LoginInput {
  matricula: string
  senha: string
}

interface SignupInput extends LoginInput {
  confirmarSenha: string
  email: string
  nome: string
}

type AuthUserView = {
  id: string | number
  email: string
  matricula: string
  name: string
}

type LoginResult = { success: true; user: AuthUserView } | { success: false; message: string }

type SignupResult =
  | { success: true; matricula: string }
  | { success: false; field?: keyof SignupInput; message: string }

const matriculaPattern = /^\d{6,12}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const matricula = text(input.matricula)
  const senha = typeof input.senha === 'string' ? input.senha : ''

  if (!matriculaPattern.test(matricula) || !senha) {
    return {
      success: false,
      message: 'Informe uma matrícula válida e sua senha.',
    }
  }

  try {
    const user = await appAuth.login(matricula, senha)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        matricula: user.username,
        name: user.name,
      },
    }
  } catch {
    return {
      success: false,
      message: 'Matrícula ou senha incorreta.',
    }
  }
}

export async function signupAction(input: SignupInput): Promise<SignupResult> {
  const nome = text(input.nome)
  const matricula = text(input.matricula)
  const email = text(input.email).toLowerCase()
  const senha = typeof input.senha === 'string' ? input.senha : ''
  const confirmarSenha = typeof input.confirmarSenha === 'string' ? input.confirmarSenha : ''

  if (nome.length < 2 || nome.length > 80) {
    return {
      success: false,
      field: 'nome',
      message: 'Informe seu nome completo.',
    }
  }
  if (!matriculaPattern.test(matricula)) {
    return {
      success: false,
      field: 'matricula',
      message: 'A matrícula deve conter de 6 a 12 números.',
    }
  }
  if (!emailPattern.test(email) || email.length > 120) {
    return {
      success: false,
      field: 'email',
      message: 'Informe um e-mail válido.',
    }
  }
  if (senha.length < 8) {
    return {
      success: false,
      field: 'senha',
      message: 'A senha deve ter pelo menos 8 caracteres.',
    }
  }
  if (senha !== confirmarSenha) {
    return {
      success: false,
      field: 'confirmarSenha',
      message: 'As senhas não coincidem.',
    }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'users',
      data: {
        email,
        name: nome,
        password: senha,
        username: matricula,
      },
      overrideAccess: false,
    })

    return { success: true, matricula }
  } catch {
    return {
      success: false,
      message: 'Matrícula ou e-mail já cadastrado.',
    }
  }
}

export async function logoutAction(): Promise<{ success: true }> {
  await appAuth.logout()
  return { success: true }
}

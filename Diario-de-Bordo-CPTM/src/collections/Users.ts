import type { Access, CollectionConfig } from 'payload'

const isSelf: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false

  return {
    id: {
      equals: req.user.id,
    },
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: () => true,
    delete: () => false,
    read: isSelf,
    update: isSelf,
  },
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: false,
      requireEmail: true,
      requireUsername: true,
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
    },
  ],
  labels: {
    plural: 'Usuários do aplicativo',
    singular: 'Usuário do aplicativo',
  },
  versions: false,
}

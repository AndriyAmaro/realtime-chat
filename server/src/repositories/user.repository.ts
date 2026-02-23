import { prisma } from '../config/index.js'
import type { Status } from '../generated/prisma/client.js'

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    })
  },

  create(data: { name: string; email: string; password: string }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    })
  },

  updateStatus(id: string, status: Status) {
    return prisma.user.update({
      where: { id },
      data: { status },
    })
  },

  updateProfile(id: string, data: { name?: string; avatar?: string | null }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    })
  },

  updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })
  },

  findByIdWithPassword(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, password: true },
    })
  },

  findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true },
    })
  },
}

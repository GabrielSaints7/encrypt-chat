// src/services/userService.js
import { prisma } from "../database/prisma.js";

export class UserService {
  static async createUser(userData) {
    console.log(" Iniciando criação de usuário:", userData);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
      },
    });

    console.log(" Usuário criado com ID:", user.id);
    return user;
  }

  static async getUserById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  static async getAllUsers() {
    return await prisma.user.findMany();
  }

  static async getUserWithGroups(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userGroups: {
          include: {
            group: true,
          },
        },
      },
    });
  }
}

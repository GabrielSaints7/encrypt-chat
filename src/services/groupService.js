// src/services/groupService.js
import { prisma } from "../database/prisma.js";
import { CryptoUtils } from "../crypto/cryptoUtils.js";

export class GroupService {
  static async createGroup(name, creatorId) {
    console.log(" INICIANDO CRIAÇÃO DE GRUPO");
    console.log(" Nome do grupo:", name);
    console.log(" ID do criador:", creatorId);

    const inviteKey = CryptoUtils.generateAESKey().toString("hex");
    console.log(" Chave de convite do grupo gerada:", inviteKey);

    const group = await prisma.group.create({
      data: {
        name,
        inviteKey,
        members: {
          create: {
            userId: creatorId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(" GRUPO CRIADO COM SUCESSO");
    console.log(" ID do grupo:", group.id);
    console.log(
      " Membros iniciais:",
      group.members.map((m) => m.user.name)
    );

    return group;
  }

  static async getAllGroups() {
    console.log(" BUSCANDO TODOS OS GRUPOS");

    const groups = await prisma.group.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    console.log(` ${groups.length} grupos encontrados`);
    return groups;
  }

  static async getUserGroups(userId) {
    console.log(" BUSCANDO GRUPOS DO USUÁRIO:", userId);

    const userGroups = await prisma.userGroup.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
            _count: {
              select: {
                members: true,
                messages: true,
              },
            },
          },
        },
      },
    });

    const groups = userGroups.map((ug) => ug.group);
    console.log(` ${groups.length} grupos encontrados para o usuário`);
    return groups;
  }

  static async getGroupById(groupId) {
    console.log(" BUSCANDO GRUPO POR ID:", groupId);

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (group) {
      console.log(" Grupo encontrado:", group.name);
    } else {
      console.log(" Grupo não encontrado");
    }

    return group;
  }

  static async addUserToGroup(userId, groupId, inviteKey) {
    console.log(`➕ ADICIONANDO USUÁRIO ${userId} AO GRUPO ${groupId}`);

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new Error("Grupo não encontrado");
    }

    if (group.inviteKey !== inviteKey) {
      throw new Error("Chave de convite inválida");
    }

    // Verificar se o usuário já é membro
    const existingMember = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (existingMember) {
      throw new Error("Usuário já é membro deste grupo");
    }

    const userGroup = await prisma.userGroup.create({
      data: {
        userId,
        groupId,
      },
      include: {
        user: true,
        group: true,
      },
    });

    console.log(" USUÁRIO ADICIONADO AO GRUPO");
    console.log(" Usuário:", userGroup.user.name);
    console.log(" Grupo:", userGroup.group.name);

    return userGroup;
  }

  static async removeUserFromGroup(userId, groupId) {
    console.log(`➖ REMOVENDO USUÁRIO ${userId} DO GRUPO ${groupId}`);

    // Verificar se o usuário é membro
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!userGroup) {
      throw new Error("Usuário não é membro deste grupo");
    }

    // Remover usuário
    await prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    // Gerar nova chave de convite
    const newInviteKey = CryptoUtils.generateAESKey().toString("hex");
    await prisma.group.update({
      where: { id: groupId },
      data: { inviteKey: newInviteKey },
    });

    console.log(" NOVA CHAVE DE CONVITE GERADA PARA O GRUPO:", newInviteKey);
    console.log(" USUÁRIO REMOVIDO E CHAVE REGENERADA");

    return { newInviteKey };
  }

  static async sendGroupMessage(senderId, groupId, content, aesKey) {
    console.log("📤 INICIANDO ENVIO DE MENSAGEM DE GRUPO");
    console.log(" Remetente:", senderId);
    console.log(" Grupo:", groupId);
    console.log(
      " Conteúdo original (criptografado):",
      content.substring(0, 50) + "..."
    );

    // Verificar se o remetente é membro do grupo
    const membership = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: senderId,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      throw new Error("Usuário não é membro deste grupo");
    }

    const message = await prisma.groupMessage.create({
      data: {
        content: content,
        senderId,
        groupId,
      },
      include: {
        sender: true,
        group: true,
      },
    });

    console.log(" MENSAGEM DE GRUPO ENVIADA COM SUCESSO");
    console.log(" ID da mensagem:", message.id);
    console.log("⏰ Timestamp:", message.createdAt);

    return message;
  }

  static async getGroupMessages(groupId) {
    console.log("📨 BUSCANDO MENSAGENS DO GRUPO:", groupId);

    const messages = await prisma.groupMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: true,
        group: true,
      },
    });

    console.log(` ${messages.length} mensagens de grupo encontradas`);
    return messages;
  }

  static async getGroupMembers(groupId) {
    console.log(" BUSCANDO MEMBROS DO GRUPO:", groupId);

    const members = await prisma.userGroup.findMany({
      where: { groupId },
      include: {
        user: true,
      },
    });

    console.log(` ${members.length} membros encontrados no grupo`);
    return members;
  }
}

// src/services/websocketService.js (atualizado)
import { prisma } from "../database/prisma.js";

export class WebSocketService {
  static wss = null;
  static connections = new Map(); // userId -> WebSocket

  static initialize(webSocketServer) {
    this.wss = webSocketServer;

    this.wss.on("connection", (ws) => {
      console.log("🔗 NOVA CONEXÃO WEBSOCKET ESTABELECIDA");
      console.log(" Conexões ativas:", this.connections.size + 1);

      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error(" ERRO AO PROCESSAR MENSAGEM WEBSOCKET:", error);
        }
      });

      ws.on("close", () => {
        this.handleDisconnection(ws);
      });

      ws.on("error", (error) => {
        console.error(" ERRO WEBSOCKET:", error);
      });
    });
  }

  static async handleMessage(ws, message) {
    console.log("📨 MENSAGEM WEBSOCKET RECEBIDA:", message.type);
    console.log(" Dados da mensagem:", message.data);

    switch (message.type) {
      case "register":
        await this.registerUser(ws, message.data);
        break;
      case "direct_message":
        await this.handleDirectMessage(message.data);
        break;
      case "group_message":
        await this.handleGroupMessage(message.data);
        break;
      case "typing":
        this.handleTyping(message.data);
        break;
      case "user_online":
        this.handleUserOnline(message.data);
        break;
      default:
        console.log(
          " TIPO DE MENSAGEM WEBSOCKET DESCONHECIDO:",
          message.type
        );
    }
  }

  static async registerUser(ws, data) {
    const { userId } = data;
    this.connections.set(userId, ws);
    console.log(` USUÁRIO ${userId} REGISTRADO NO WEBSOCKET`);
    console.log(" Conexões ativas:", this.connections.size);

    // Notificar outros usuários que este usuário está online
    this.broadcastToAll(userId, {
      type: "user_status",
      data: { userId, online: true },
    });

    // Enviar confirmação
    this.sendToUser(userId, {
      type: "registered",
      data: { success: true, onlineUsers: Array.from(this.connections.keys()) },
    });
  }

  static async handleDirectMessage(data) {
    const { fromUserId, toUserId, content, encryptedContent } = data;
    console.log(`💬 MENSAGEM DIRETA DE ${fromUserId} PARA ${toUserId}`);
    console.log(" Conteúdo:", content);
    console.log(" Conteúdo criptografado:", encryptedContent);

    // Salvar no banco de dados
    try {
      const message = await prisma.message.create({
        data: {
          content: encryptedContent,
          senderId: fromUserId,
          receiverId: toUserId,
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      console.log("💾 Mensagem salva no banco de dados, ID:", message.id);
    } catch (error) {
      console.error(" ERRO AO SALVAR MENSAGEM NO BANCO:", error);
    }

    // Encaminhar mensagem para o destinatário
    this.sendToUser(toUserId, {
      type: "direct_message",
      data: {
        fromUserId,
        content,
        encryptedContent,
        timestamp: new Date().toISOString(),
      },
    });

    // Confirmação para o remetente
    this.sendToUser(fromUserId, {
      type: "message_sent",
      data: {
        success: true,
        toUserId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async handleGroupMessage(data) {
    const { fromUserId, groupId, content, encryptedContent } = data;
    console.log(` MENSAGEM DE GRUPO DE ${fromUserId} NO GRUPO ${groupId}`);
    console.log(" Conteúdo:", content);
    console.log(" Conteúdo criptografado:", encryptedContent);

    // Salvar no banco de dados
    try {
      const message = await prisma.groupMessage.create({
        data: {
          content: encryptedContent,
          senderId: fromUserId,
          groupId: parseInt(groupId),
        },
        include: {
          sender: true,
          group: true,
        },
      });

      console.log("💾 Mensagem de grupo salva no banco, ID:", message.id);
    } catch (error) {
      console.error(" ERRO AO SALVAR MENSAGEM DE GRUPO:", error);
    }

    // Buscar membros do grupo
    const groupMembers = await prisma.userGroup.findMany({
      where: { groupId: parseInt(groupId) },
      select: { userId: true },
    });

    const memberIds = groupMembers.map((m) => m.userId);
    console.log(` Membros do grupo: ${memberIds.join(", ")}`);

    // Enviar para todos os membros (exceto o remetente)
    this.broadcastToUsers(memberIds, fromUserId, {
      type: "group_message",
      data: {
        fromUserId,
        groupId,
        content,
        encryptedContent,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static handleTyping(data) {
    const { fromUserId, toUserId, isTyping, chatType, groupId } = data;

    if (chatType === "direct") {
      this.sendToUser(toUserId, {
        type: "typing",
        data: { fromUserId, isTyping, chatType },
      });
    } else if (chatType === "group") {
      // Enviar para todos os membros do grupo (exceto quem está digitando)
      this.broadcastToGroup(groupId, fromUserId, {
        type: "typing",
        data: { fromUserId, groupId, isTyping, chatType },
      });
    }
  }

  static handleUserOnline(data) {
    const { userId } = data;
    this.broadcastToAll(userId, {
      type: "user_online",
      data: { userId, online: true, timestamp: new Date().toISOString() },
    });
  }

  static handleDisconnection(ws) {
    // Encontrar e remover usuário desconectado
    let disconnectedUserId = null;
    for (const [userId, connection] of this.connections.entries()) {
      if (connection === ws) {
        disconnectedUserId = userId;
        this.connections.delete(userId);
        console.log(` USUÁRIO ${userId} DESCONECTADO DO WEBSOCKET`);
        break;
      }
    }

    console.log(" Conexões ativas:", this.connections.size);

    // Notificar outros usuários que este usuário está offline
    if (disconnectedUserId) {
      this.broadcastToAll(disconnectedUserId, {
        type: "user_status",
        data: { userId: disconnectedUserId, online: false },
      });
    }
  }

  static sendToUser(userId, message) {
    const ws = this.connections.get(parseInt(userId));
    if (ws && ws.readyState === 1) {
      // 1 = OPEN
      ws.send(JSON.stringify(message));
      console.log(`📤 MENSAGEM ENVIADA PARA USUÁRIO ${userId}:`, message.type);
    } else {
      console.log(` USUÁRIO ${userId} NÃO ESTÁ CONECTADO`);
    }
  }

  static broadcastToGroup(groupId, excludeUserId, message) {
    console.log(
      ` BROADCAST PARA GRUPO ${groupId}, EXCLUINDO ${excludeUserId}`
    );

    // Em uma implementação real, buscaríamos os membros do grupo do banco
    // Por enquanto, vamos enviar para todos os usuários conectados (exceto o remetente)
    this.connections.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === 1) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  static broadcastToUsers(userIds, excludeUserId, message) {
    console.log(
      ` BROADCAST PARA ${userIds.length} USUÁRIOS, EXCLUINDO ${excludeUserId}`
    );

    userIds.forEach((userId) => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, message);
      }
    });
  }

  static broadcastToAll(excludeUserId, message) {
    console.log(` BROADCAST PARA TODOS, EXCLUINDO ${excludeUserId}`);

    this.connections.forEach((ws, userId) => {
      if (userId !== excludeUserId && ws.readyState === 1) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

// src/services/messageService.js - VERSÃO CORRIGIDA
import { prisma } from "../database/prisma.js";

export class MessageService {
  static async sendDirectMessage(senderId, receiverId, content) {
    console.log("💾 SALVANDO MENSAGEM NO BANCO...");
    console.log("👤 De:", senderId, "Para:", receiverId);
    console.log("📝 Conteúdo (início):", content.substring(0, 50) + "...");

    try {
      const message = await prisma.message.create({
        data: {
          content: content,
          senderId: senderId,
          receiverId: receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      console.log("✅ MENSAGEM SALVA - ID:", message.id);
      console.log("⏰ Timestamp:", message.createdAt);

      return message;
    } catch (error) {
      console.error("❌ ERRO AO SALVAR MENSAGEM:", error);
      throw error;
    }
  }

  static async getDirectMessages(userId, otherUserId) {
    console.log("🔍 BUSCANDO MENSAGENS ENTRE:", userId, "e", otherUserId);

    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      console.log(`📊 ${messages.length} mensagens encontradas no banco`);

      // Log do conteúdo das primeiras mensagens para debug
      messages.slice(0, 3).forEach((msg, index) => {
        console.log(
          `   ${index + 1}. ID:${msg.id} - Conteúdo: ${msg.content.substring(
            0,
            30
          )}...`
        );
      });

      return messages;
    } catch (error) {
      console.error("❌ ERRO AO BUSCAR MENSAGENS:", error);
      throw error;
    }
  }
}

// src/controllers/messageController.js - VERSÃO CORRIGIDA
import { MessageService } from "../services/messageService.js";
import { CryptoUtils } from "../crypto/cryptoUtils.js";

export class MessageController {
  static async sendDirectMessage(req, res) {
    try {
      const { senderId, receiverId, content, publicKey } = req.body;

      console.log("SOLICITAÇÃO ENVIAR MENSAGEM:", {
        senderId,
        receiverId,
        content: content.substring(0, 50) + "...",
        publicKey: publicKey
          ? publicKey.substring(0, 32) + "..."
          : "Não fornecida",
      });

      // Se não há publicKey, usar criptografia simples
      if (!publicKey) {
        console.log("  Sem chave pública, usando criptografia simples");
        const message = await MessageService.sendDirectMessage(
          senderId,
          receiverId,
          content
        );
        return res.status(201).json({
          success: true,
          message: message,
          encryptionType: "simple",
        });
      }

      console.log(" Iniciando processo de criptografia Diffie-Hellman");

      // Gerar chaves Diffie-Hellman para o remetente
      const senderKeys = CryptoUtils.generateDiffieHellmanKeys();

      // Calcular segredo compartilhado usando a chave pública do destinatário
      const sharedSecret = CryptoUtils.computeSharedSecret(
        senderKeys.privateKey,
        Buffer.from(publicKey, "hex")
      );

      // Derivar chave AES do segredo compartilhado
      const aesKey = CryptoUtils.deriveAESKeyFromSharedSecret(sharedSecret);

      // Criptografar a mensagem
      const encryptedContent = CryptoUtils.encryptAES(content, aesKey);

      // Salvar mensagem criptografada
      const message = await MessageService.sendDirectMessage(
        senderId,
        receiverId,
        encryptedContent
      );

      console.log(" Mensagem criptografada e salva com sucesso");

      res.status(201).json({
        success: true,
        message: message,
        senderPublicKey: senderKeys.publicKey.toString("hex"),
        encryptionType: "diffie-hellman",
      });
    } catch (error) {
      console.error(" Erro ao enviar mensagem direta:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getDirectMessages(req, res) {
    try {
      const { userId, otherUserId } = req.params;
      const { privateKey, otherUserPublicKey } = req.query; // USAR QUERY PARAMS

      console.log("SOLICITAÇÃO BUSCAR MENSAGENS:", {
        userId,
        otherUserId,
        privateKey: privateKey ? "Fornecida" : "Não fornecida",
        otherUserPublicKey: otherUserPublicKey ? "Fornecida" : "Não fornecida",
      });

      const messages = await MessageService.getDirectMessages(
        parseInt(userId),
        parseInt(otherUserId)
      );

      console.log(`${messages.length} mensagens encontradas no banco`);

      // Se as chaves foram fornecidas, tentar descriptografar
      if (privateKey && otherUserPublicKey) {
        console.log(" Tentando descriptografar mensagens...");

        try {
          const sharedSecret = CryptoUtils.computeSharedSecret(
            Buffer.from(privateKey, "hex"),
            Buffer.from(otherUserPublicKey, "hex")
          );
          const aesKey = CryptoUtils.deriveAESKeyFromSharedSecret(sharedSecret);

          const decryptedMessages = messages.map((msg) => {
            try {
              const decryptedContent = CryptoUtils.decryptAES(
                msg.content,
                aesKey
              );
              return {
                ...msg,
                decryptedContent: decryptedContent,
                originalContent: msg.content, // Manter original para debug
              };
            } catch (decryptError) {
              console.error(
                ` Erro ao descriptografar mensagem ${msg.id}:`,
                decryptError.message
              );
              return {
                ...msg,
                decryptedContent: "[Erro na descriptografia]",
                originalContent: msg.content,
              };
            }
          });

          console.log(` ${decryptedMessages.length} mensagens processadas`);
          res.json({
            success: true,
            messages: decryptedMessages,
            encryptionStatus: "decrypted",
          });
        } catch (cryptoError) {
          console.error(" Erro no processo de descriptografia:", cryptoError);
          // Retornar mensagens criptografadas em caso de erro
          res.json({
            success: true,
            messages: messages,
            encryptionStatus: "encrypted",
            error: "Falha na descriptografia",
          });
        }
      } else {
        console.log("  Sem chaves, retornando mensagens criptografadas");
        res.json({
          success: true,
          messages: messages,
          encryptionStatus: "encrypted",
        });
      }
    } catch (error) {
      console.error(" Erro ao buscar mensagens:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

// src/controllers/groupController.js
import { GroupService } from "../services/groupService.js";
import { CryptoUtils } from "../crypto/cryptoUtils.js";

export class GroupController {
  static async createGroup(req, res) {
    try {
      const { name, creatorId } = req.body;

      console.log(" SOLICITAÇÃO: Criar grupo");
      console.log(" Nome do grupo:", name);
      console.log(" ID do criador:", creatorId);

      const group = await GroupService.createGroup(name, creatorId);

      console.log("RESPOSTA: Grupo criado com sucesso");
      console.log(" Dados do grupo:", group);

      res.status(201).json(group);
    } catch (error) {
      console.error(" ERRO: Falha ao criar grupo:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllGroups(req, res) {
    try {
      console.log(" SOLICITAÇÃO: Listar todos os grupos");

      const groups = await GroupService.getAllGroups();

      console.log(`RESPOSTA: ${groups.length} grupos encontrados`);

      res.json(groups);
    } catch (error) {
      console.error(" ERRO: Falha ao listar grupos:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserGroups(req, res) {
    try {
      const { userId } = req.params;
      console.log(" SOLICITAÇÃO: Buscar grupos do usuário:", userId);

      const groups = await GroupService.getUserGroups(parseInt(userId));

      console.log(
        `RESPOSTA: ${groups.length} grupos encontrados para o usuário`
      );

      res.json(groups);
    } catch (error) {
      console.error(
        " ERRO: Falha ao buscar grupos do usuário:",
        error.message
      );
      res.status(500).json({ error: error.message });
    }
  }

  static async getGroupById(req, res) {
    try {
      const { groupId } = req.params;
      console.log(" SOLICITAÇÃO: Buscar grupo por ID:", groupId);

      const group = await GroupService.getGroupById(parseInt(groupId));

      if (!group) {
        console.log(" ERRO: Grupo não encontrado");
        return res.status(404).json({ error: "Grupo não encontrado" });
      }

      console.log("RESPOSTA: Grupo encontrado");

      res.json(group);
    } catch (error) {
      console.error(" ERRO: Falha ao buscar grupo:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async joinGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { userId, inviteKey } = req.body;

      console.log(" SOLICITAÇÃO: Entrar em grupo");
      console.log(" ID do grupo:", groupId);
      console.log(" ID do usuário:", userId);
      console.log(" Chave de convite:", inviteKey);

      const userGroup = await GroupService.addUserToGroup(
        parseInt(userId),
        parseInt(groupId),
        inviteKey
      );

      console.log("RESPOSTA: Usuário entrou no grupo com sucesso");
      console.log(" Dados da associação:", userGroup);

      res.json(userGroup);
    } catch (error) {
      console.error(" ERRO: Falha ao entrar no grupo:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async leaveGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;

      console.log(" SOLICITAÇÃO: Sair do grupo");
      console.log(" ID do grupo:", groupId);
      console.log(" ID do usuário:", userId);

      await GroupService.removeUserFromGroup(
        parseInt(userId),
        parseInt(groupId)
      );

      console.log("RESPOSTA: Usuário saiu do grupo com sucesso");

      res.json({ message: "Usuário removido do grupo com sucesso" });
    } catch (error) {
      console.error(" ERRO: Falha ao sair do grupo:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async sendGroupMessage(req, res) {
    try {
      const { groupId } = req.params;
      const { senderId, content, groupKey } = req.body;

      console.log(" SOLICITAÇÃO: Enviar mensagem no grupo");
      console.log(" ID do grupo:", groupId);
      console.log(" ID do remetente:", senderId);
      console.log(" Conteúdo criptografado:", content);
      console.log(" Chave do grupo:", groupKey);  

      const message = await GroupService.sendGroupMessage(
        parseInt(senderId),
        parseInt(groupId),
        content,
        Buffer.from(groupKey, "hex")
      );

      console.log("RESPOSTA: Mensagem de grupo enviada com sucesso");
      console.log(" Mensagem salva no banco:", message);

      res.status(201).json(message);
    } catch (error) {
      console.error(
        " ERRO: Falha ao enviar mensagem no grupo:",
        error.message
      );
      res.status(500).json({ error: error.message });
    }
  }

  static async getGroupMessages(req, res) {
    try {
      const { groupId } = req.params;

      console.log(" SOLICITAÇÃO: Buscar mensagens do grupo");
      console.log(" ID do grupo:", groupId);

      const messages = await GroupService.getGroupMessages(parseInt(groupId));

      console.log(`RESPOSTA: ${messages.length} mensagens encontradas`);

      res.json(messages);
    } catch (error) {
      console.error(
        " ERRO: Falha ao buscar mensagens do grupo:",
        error.message
      );
      res.status(500).json({ error: error.message });
    }
  }

  static async getGroupMembers(req, res) {
    try {
      const { groupId } = req.params;

      console.log(" SOLICITAÇÃO: Buscar membros do grupo");
      console.log(" ID do grupo:", groupId);

      const members = await GroupService.getGroupMembers(parseInt(groupId));

      console.log(`RESPOSTA: ${members.length} membros encontrados`);

      res.json(members);
    } catch (error) {
      console.error(
        " ERRO: Falha ao buscar membros do grupo:",
        error.message
      );
      res.status(500).json({ error: error.message });
    }
  }
}

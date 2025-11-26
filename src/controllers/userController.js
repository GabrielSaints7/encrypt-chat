// src/controllers/userController.js
import { UserService } from "../services/userService.js";

export class UserController {
  static async createUser(req, res) {
    try {
      console.log(" SOLICITAÇÃO: Criar usuário");
      console.log(" Dados recebidos:", req.body);

      const user = await UserService.createUser(req.body);

      console.log(" RESPOSTA: Usuário criado com sucesso");
      console.log(" Dados do usuário:", user);

      res.status(201).json(user);
    } catch (error) {
      console.error(" ERRO: Falha ao criar usuário:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async getUsers(req, res) {
    try {
      console.log(" SOLICITAÇÃO: Listar usuários");

      const users = await UserService.getAllUsers();

      console.log(` RESPOSTA: ${users.length} usuários encontrados`);

      res.json(users);
    } catch (error) {
      console.error(" ERRO: Falha ao listar usuários:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      console.log(" SOLICITAÇÃO: Buscar usuário por ID:", id);

      const user = await UserService.getUserById(parseInt(id));

      if (!user) {
        console.log(" ERRO: Usuário não encontrado");
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      console.log(" RESPOSTA: Usuário encontrado");

      res.json(user);
    } catch (error) {
      console.error(" ERRO: Falha ao buscar usuário:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
}

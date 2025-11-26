// src/routes/index.js
import express from "express";
import { UserController } from "../controllers/userController.js";
import { MessageController } from "../controllers/messageController.js";
import { GroupController } from "../controllers/groupController.js";
import { CryptoUtils } from "../crypto/cryptoUtils.js";

const router = express.Router();

// Rotas de usuário
router.post("/users", UserController.createUser);
router.get("/users", UserController.getUsers);
router.get("/users/:id", UserController.getUserById);

// Rotas de mensagens
router.post("/messages/direct", MessageController.sendDirectMessage);
router.get(
  "/messages/direct/:userId/:otherUserId",
  MessageController.getDirectMessages
);

// Rotas de grupos
router.post("/groups", GroupController.createGroup);
router.get("/groups", GroupController.getAllGroups);
router.get("/groups/user/:userId", GroupController.getUserGroups);
router.get("/groups/:groupId", GroupController.getGroupById);
router.post("/groups/:groupId/join", GroupController.joinGroup);
router.delete("/groups/:groupId/leave", GroupController.leaveGroup);
router.post("/groups/:groupId/messages", GroupController.sendGroupMessage);
router.get("/groups/:groupId/messages", GroupController.getGroupMessages);
router.get("/groups/:groupId/members", GroupController.getGroupMembers);

//gerar tokens
router.post("/generate-keys", (req, res) => {
  try {
    const keys = CryptoUtils.generateDiffieHellmanKeys();
    res.json({
      success: true,
      privateKey: keys.privateKey.toString("hex"),
      publicKey: keys.publicKey.toString("hex"),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

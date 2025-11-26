// src/app.js
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import routes from "./routes/index.js";
import { prisma } from "./database/prisma.js";
import { WebSocketService } from "./services/websocketService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, "../public"))); // Servir arquivos estáticos
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Inicializar WebSocket
WebSocketService.initialize(wss);

// Rota principal para servir o frontend
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

// Inicialização do servidor
async function startServer() {
  try {
    await prisma.$connect();
    console.log(" Conectado ao banco de dados PostgreSQL");

    server.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(" Endpoints disponíveis:");
      console.log(`   http://localhost:${PORT}/`);
      console.log(`   http://localhost:${PORT}/health`);
      console.log(`   http://localhost:${PORT}/api/users`);
      console.log(`   http://localhost:${PORT}/api/messages`);
      console.log(`   http://localhost:${PORT}/api/groups`);
    });
  } catch (error) {
    console.error(" Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Desligando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

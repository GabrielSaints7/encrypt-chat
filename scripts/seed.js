// scripts/seed-enhanced.js
import { PrismaClient } from "@prisma/client";
import { CryptoUtils } from "../src/crypto/cryptoUtils.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 INICIANDO SEED AVANÇADO...\n");

  // Limpar dados existentes
  console.log("🧹 Limpando dados existentes...");
  await prisma.groupMessage.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.message.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  // 1. Criar usuários
  console.log("\n👥 CRIANDO USUÁRIOS...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Silva",
        phone: "11999999999",
        email: "alice.silva@email.com",
      },
    }),
    prisma.user.create({
      data: {
        name: "Bob Santos",
        phone: "11888888888",
        email: "bob.santos@email.com",
      },
    }),
    prisma.user.create({
      data: {
        name: "Carol Oliveira",
        phone: "11777777777",
        email: "carol.oliveira@email.com",
      },
    }),
    prisma.user.create({
      data: {
        name: "Daniel Costa",
        phone: "11666666666",
        email: "daniel.costa@email.com",
      },
    }),
    prisma.user.create({
      data: {
        name: "Eva Pereira",
        phone: "11555555555",
        email: "eva.pereira@email.com",
      },
    }),
  ]);

  console.log("✅ Usuários criados:");
  users.forEach((user) => {
    console.log(`   👤 ${user.name} (ID: ${user.id}) - ${user.email}`);
  });

  // 2. Gerar chaves Diffie-Hellman para cada usuário (simulação)
  console.log("\n🔑 GERANDO CHAVES DE CRIPTOGRAFIA...");
  const userKeys = new Map();

  for (const user of users) {
    const keys = CryptoUtils.generateDiffieHellmanKeys();
    userKeys.set(user.id, keys);
    console.log(`   🔐 ${user.name}: Chaves DH geradas`);
  }

  // 3. Criar grupos
  console.log("\n👥 CRIANDO GRUPOS...");

  const familyGroup = await prisma.group.create({
    data: {
      name: "👨‍👩‍👧‍👦 Família Silva",
      inviteKey: CryptoUtils.generateAESKey().toString("hex"),
      members: {
        create: [
          { userId: users[0].id }, // Alice
          { userId: users[1].id }, // Bob
          { userId: users[2].id }, // Carol
        ],
      },
    },
    include: { members: true },
  });

  const friendsGroup = await prisma.group.create({
    data: {
      name: "🎮 Amigos do Churrasco",
      inviteKey: CryptoUtils.generateAESKey().toString("hex"),
      members: {
        create: [
          { userId: users[1].id }, // Bob
          { userId: users[3].id }, // Daniel
          { userId: users[4].id }, // Eva
        ],
      },
    },
    include: { members: true },
  });

  const workGroup = await prisma.group.create({
    data: {
      name: "💼 Trabalho - Projeto Alpha",
      inviteKey: CryptoUtils.generateAESKey().toString("hex"),
      members: {
        create: [
          { userId: users[0].id }, // Alice
          { userId: users[3].id }, // Daniel
          { userId: users[4].id }, // Eva
        ],
      },
    },
    include: { members: true },
  });

  console.log("✅ Grupos criados:");
  console.log(
    `   👥 ${familyGroup.name} (${familyGroup.members.length} membros)`
  );
  console.log(
    `   👥 ${friendsGroup.name} (${friendsGroup.members.length} membros)`
  );
  console.log(`   👥 ${workGroup.name} (${workGroup.members.length} membros)`);

  // 4. Criar mensagens diretas (conversas 1:1)
  console.log("\n💬 CRIANDO MENSAGENS DIRETAS...");

  // Conversa entre Alice e Bob
  console.log("   💭 Alice ↔ Bob: Criando conversa...");
  await createDirectMessages(users[0], users[1], userKeys, [
    "👋 Oi Bob! Tudo bem?",
    "Oi Alice! Tudo sim, e com você?",
    "Aqui tudo ótimo! Vamos sair hoje?",
    "Claro! Que tal aquele restaurante novo?",
    "Perfeito! 🎉 Que horas?",
    "Às 19h? Posso te buscar.",
    "Ótimo! Te vejo mais tarde então! 😊",
  ]);

  // Conversa entre Bob e Carol
  console.log("   💭 Bob ↔ Carol: Criando conversa...");
  await createDirectMessages(users[1], users[2], userKeys, [
    "Carol, você viu as novas specs do projeto?",
    "Ainda não Bob, tem algo importante?",
    "Sim, mudaram os requisitos de segurança.",
    "Poxa, vou dar uma olhada. Obrigada pelo aviso!",
    "Precisamos conversar amanhã sobre isso.",
    "Combinado! Te encontro às 10h na sala de reuniões.",
  ]);

  // Conversa entre Alice e Daniel
  console.log("   💭 Alice ↔ Daniel: Criando conversa...");
  await createDirectMessages(users[0], users[3], userKeys, [
    "Daniel, conseguiu revisar o documento?",
    "Quase terminando Alice! Só faltam os anexos.",
    "Que bom! Pode enviar hoje ainda?",
    "Claro! Antes das 18h prometo. 📝",
    "Perfeito! Obrigada pela agilidade!",
    "Disponha! Qualquer coisa me avise.",
  ]);

  // Conversa entre Eva e Carol
  console.log("   💭 Eva ↔ Carol: Criando conversa...");
  await createDirectMessages(users[4], users[2], userKeys, [
    "Carol, você vai na festa sábado?",
    "Vou sim Eva! Você também? 🎉",
    "Claro! Vai ser incrível!",
    "Mal posso esperar! Vamos nos arrumar juntas?",
    "Sim! Que tal na minha casa às 18h?",
    "Perfeito! Levo uns snacks! 🍕",
  ]);

  // 5. Criar mensagens em grupos
  console.log("\n👥 CRIANDO MENSAGENS EM GRUPOS...");

  // Mensagens no grupo Família
  console.log("   👨‍👩‍👧‍👦 Família Silva: Criando conversa...");
  await createGroupMessages(familyGroup, users, userKeys, [
    { sender: users[0], content: "Boa tarde família! Como vocês estão? 👋" },
    { sender: users[1], content: "Oi Alice! Tudo bem aqui! E você?" },
    { sender: users[2], content: "Tudo ótimo! Saudades de vocês! ❤️" },
    { sender: users[0], content: "Que tal um almoço de domingo?" },
    {
      sender: users[1],
      content: "Adorei a ideia! Posso levar a sobremesa! 🍰",
    },
    { sender: users[2], content: "Eu levo o vinho! 🍷" },
  ]);

  // Mensagens no grupo Amigos
  console.log("   🎮 Amigos do Churrasco: Criando conversa...");
  await createGroupMessages(friendsGroup, users, userKeys, [
    { sender: users[1], content: "Galera, churrasco no sábado? 🍖" },
    { sender: users[3], content: "Boa! Eu levo a cerveja! 🍺" },
    { sender: users[4], content: "Eu faço a farofa! count me in! 😋" },
    { sender: users[1], content: "Perfeito! Na minha casa às 15h!" },
    { sender: users[3], content: "Alguém se oferece para a saladinha? 🥗" },
    { sender: users[4], content: "Deixa comigo! Levo uma salada caprese!" },
  ]);

  // Mensagens no grupo Trabalho
  console.log("   💼 Trabalho - Projeto Alpha: Criando conversa...");
  await createGroupMessages(workGroup, users, userKeys, [
    { sender: users[0], content: "Bom dia time! Reunião de status às 10h." },
    { sender: users[3], content: "Bom dia! Estarei presente. 📊" },
    { sender: users[4], content: "Presente! Levo o café! ☕" },
    {
      sender: users[0],
      content: "Ótimo! Vamos revisar os milestones do projeto.",
    },
    { sender: users[3], content: "Tenho updates importantes do cliente." },
    { sender: users[4], content: "Preparei os relatórios de performance." },
  ]);

  // 6. Estatísticas finais
  console.log("\n📊 ESTATÍSTICAS DO SEED:");

  const totalUsers = await prisma.user.count();
  const totalGroups = await prisma.group.count();
  const totalDirectMessages = await prisma.message.count();
  const totalGroupMessages = await prisma.groupMessage.count();
  const totalUserGroups = await prisma.userGroup.count();

  console.log(`   👤 Total de usuários: ${totalUsers}`);
  console.log(`   👥 Total de grupos: ${totalGroups}`);
  console.log(`   💬 Mensagens diretas: ${totalDirectMessages}`);
  console.log(`   📢 Mensagens em grupos: ${totalGroupMessages}`);
  console.log(`   🔗 Membros em grupos: ${totalUserGroups}`);

  console.log("\n🎉 SEED CONCLUÍDO COM SUCESSO!");
  console.log("\n💡 DICAS PARA TESTAR:");
  console.log("   1. Use Alice (ID: 1) para ver conversas com Bob e Daniel");
  console.log("   2. Use Bob (ID: 2) para ver conversas com Alice e Carol");
  console.log('   3. Teste os grupos "Família Silva" e "Amigos do Churrasco"');
  console.log("   4. As mensagens estão criptografadas no banco!");
}

// Função auxiliar para criar mensagens diretas
async function createDirectMessages(user1, user2, userKeys, messages) {
  // Simular chaves públicas trocadas
  const user1Keys = userKeys.get(user1.id);
  const user2Keys = userKeys.get(user2.id);

  // Calcular segredo compartilhado (simulação)
  const sharedSecret = CryptoUtils.computeSharedSecret(
    user1Keys.privateKey,
    user2Keys.publicKey
  );
  const aesKey = CryptoUtils.deriveAESKeyFromSharedSecret(sharedSecret);

  // Criar mensagens alternadas entre os usuários
  for (let i = 0; i < messages.length; i++) {
    const content = messages[i];
    const sender = i % 2 === 0 ? user1 : user2;
    const receiver = i % 2 === 0 ? user2 : user1;

    // Criptografar mensagem
    const encryptedContent = CryptoUtils.encryptAES(content, aesKey);

    await prisma.message.create({
      data: {
        content: encryptedContent,
        senderId: sender.id,
        receiverId: receiver.id,
        createdAt: new Date(Date.now() - (messages.length - i) * 3600000), // Timestamps diferentes
      },
    });
  }
}

// Função auxiliar para criar mensagens em grupo
async function createGroupMessages(group, users, userKeys, messages) {
  const groupAesKey = CryptoUtils.generateAESKey();

  for (const msg of messages) {
    // Criptografar mensagem do grupo
    const encryptedContent = CryptoUtils.encryptAES(msg.content, groupAesKey);

    await prisma.groupMessage.create({
      data: {
        content: encryptedContent,
        senderId: msg.sender.id,
        groupId: group.id,
        createdAt: new Date(Date.now() - Math.random() * 86400000), // Timestamps variados
      },
    });
  }
}

main()
  .catch(async (e) => {
    console.error("❌ ERRO NO SEED:", e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// scripts/test-crypto.js
import { CryptoUtils } from "../src/crypto/cryptoUtils.js";

async function testCryptoFlow() {
  console.log("🧪 INICIANDO TESTE DE CRIPTOGRAFIA...\n");

  // 1. Gerar chaves para dois usuários
  console.log("1. 🟢 Gerando chaves para Usuário A...");
  const userAKeys = CryptoUtils.generateDiffieHellmanKeys();

  console.log("\n2. 🟢 Gerando chaves para Usuário B...");
  const userBKeys = CryptoUtils.generateDiffieHellmanKeys();

  // 2. Calcular segredos compartilhados
  console.log("\n3. 🔄 Calculando segredo compartilhado (A -> B)...");
  const secretAB = CryptoUtils.computeSharedSecret(
    userAKeys.privateKey,
    userBKeys.publicKey
  );

  console.log("\n4. 🔄 Calculando segredo compartilhado (B -> A)...");
  const secretBA = CryptoUtils.computeSharedSecret(
    userBKeys.privateKey,
    userAKeys.publicKey
  );

  // 3. Verificar se os segredos são iguais
  console.log("\n5.  Verificando se os segredos são iguais...");
  const secretsMatch = secretAB.equals(secretBA);
  console.log("   Segredos iguais?:", secretsMatch);

  if (!secretsMatch) {
    console.log(" ERRO: Segredos não são iguais!");
    return;
  }

  // 4. Derivar chaves AES
  console.log("\n6.  Derivando chaves AES...");
  const aesKeyA = CryptoUtils.deriveAESKeyFromSharedSecret(secretAB);
  const aesKeyB = CryptoUtils.deriveAESKeyFromSharedSecret(secretBA);

  // 5. Testar criptografia e descriptografia
  console.log("\n7. 🧪 Testando criptografia/descriptografia...");
  const originalMessage = "Mensagem super secreta! ";
  console.log("   Mensagem original:", originalMessage);

  const encrypted = CryptoUtils.encryptAES(originalMessage, aesKeyA);
  console.log("   Mensagem criptografada:", encrypted.substring(0, 50) + "...");

  const decrypted = CryptoUtils.decryptAES(encrypted, aesKeyB);
  console.log("   Mensagem descriptografada:", decrypted);

  // 6. Verificar resultado
  console.log("\n8.  Verificando resultado...");
  const success = originalMessage === decrypted;
  console.log("   Teste bem-sucedido?:", success);

  if (success) {
    console.log(
      "\n🎉 TODOS OS TESTES PASSARAM! O sistema de criptografia está funcionando."
    );
  } else {
    console.log(
      "\n TESTE FALHOU! Há um problema no sistema de criptografia."
    );
  }
}

testCryptoFlow().catch(console.error);

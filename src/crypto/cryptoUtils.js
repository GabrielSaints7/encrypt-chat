// src/crypto/cryptoUtils.js - COM MAIS LOGS
import crypto from "crypto";
import { x25519 } from "@noble/curves/ed25519.js";

export class CryptoUtils {
  static generateAESKey() {
    const key = crypto.randomBytes(32); // AES-256
    console.log(
      "🔐 Chave AES gerada:",
      key.toString("hex").substring(0, 32) + "..."
    );
    return key;
  }

  static generateDiffieHellmanKeys() {
    console.log("🔑 Iniciando geração de chaves Diffie-Hellman...");
    const privateKey = x25519.utils.randomSecretKey();
    const publicKey = x25519.getPublicKey(privateKey);

    console.log(
      "🔑 Chave privada Diffie-Hellman gerada:",
      Buffer.from(privateKey).toString("hex").substring(0, 32) + "..."
    );
    console.log(
      "🔑 Chave pública Diffie-Hellman gerada:",
      Buffer.from(publicKey).toString("hex").substring(0, 32) + "..."
    );

    return {
      privateKey: Buffer.from(privateKey),
      publicKey: Buffer.from(publicKey),
    };
  }

  static computeSharedSecret(privateKey, publicKey) {
    console.log("🤝 Calculando segredo compartilhado...");
    console.log(
      "🔑 PrivateKey:",
      privateKey.toString("hex").substring(0, 32) + "..."
    );
    console.log(
      "🔑 PublicKey:",
      publicKey.toString("hex").substring(0, 32) + "..."
    );

    const sharedSecret = x25519.getSharedSecret(privateKey, publicKey);
    console.log(
      "🤝 Segredo compartilhado calculado:",
      Buffer.from(sharedSecret).toString("hex").substring(0, 32) + "..."
    );
    return Buffer.from(sharedSecret);
  }

  static encryptAES(text, key) {
    console.log("🔒 Iniciando criptografia AES...");
    console.log("📝 Texto original:", text);
    console.log("🔑 Chave AES:", key.toString("hex").substring(0, 32) + "...");

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const result = iv.toString("hex") + ":" + encrypted;
    console.log("🔐 Mensagem criptografada com AES - Tamanho:", result.length);
    console.log("🔐 IV + Encrypted (início):", result.substring(0, 50) + "...");
    return result;
  }

  static decryptAES(encryptedText, key) {
    console.log("🔓 Iniciando descriptografia AES...");
    console.log(
      "🔐 Texto criptografado (início):",
      encryptedText.substring(0, 50) + "..."
    );
    console.log("🔑 Chave AES:", key.toString("hex").substring(0, 32) + "...");

    const [ivHex, encrypted] = encryptedText.split(":");

    if (!ivHex || !encrypted) {
      throw new Error("Formato de texto criptografado inválido");
    }

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    console.log("📝 Mensagem descriptografada:", decrypted);
    return decrypted;
  }

  static deriveAESKeyFromSharedSecret(sharedSecret) {
    console.log("🔄 Derivando chave AES do segredo compartilhado...");
    const derivedKey = crypto
      .createHash("sha256")
      .update(sharedSecret)
      .digest();
    console.log(
      "🔐 Chave AES derivada:",
      derivedKey.toString("hex").substring(0, 32) + "..."
    );
    return derivedKey;
  }
}

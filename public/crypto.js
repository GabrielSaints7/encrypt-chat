// public/crypto.js (atualizado)
class FrontendCrypto {
  static async generateDHKeys() {
    console.log(" Iniciando geração de chaves Diffie-Hellman no frontend");

    // Simulação de geração de chaves
    // Em produção, usar Web Crypto API ou biblioteca especializada
    const privateKey = this.generateRandomHex(32);
    const publicKey = this.generateRandomHex(32);

    console.log(
      " Chave privada DH gerada:",
      privateKey.substring(0, 16) + "..."
    );
    console.log(
      " Chave pública DH gerada:",
      publicKey.substring(0, 16) + "..."
    );

    return {
      privateKey,
      publicKey,
      toString: () =>
        `DHKeys{priv:${privateKey.substring(
          0,
          8
        )}..., pub:${publicKey.substring(0, 8)}...}`,
    };
  }

  static async generateAESKey() {
    console.log(" Gerando chave AES no frontend");
    const key = this.generateRandomHex(32);
    console.log(" Chave AES gerada:", key.substring(0, 16) + "...");
    return key;
  }

  static async computeSharedSecret(privateKey, otherPublicKey) {
    console.log("🤝 Calculando segredo compartilhado no frontend");
    console.log(" Chave privada:", privateKey.substring(0, 16) + "...");
    console.log(
      " Chave pública do outro:",
      otherPublicKey.substring(0, 16) + "..."
    );

    // Simulação - em produção seria cálculo real X25519
    const combined = privateKey + otherPublicKey;
    const sharedSecret = await this.sha256(combined);

    console.log(
      "🤝 Segredo compartilhado calculado:",
      sharedSecret.substring(0, 16) + "..."
    );
    return sharedSecret;
  }

  static async deriveAESKey(sharedSecret) {
    console.log(" Derivando chave AES do segredo compartilhado");
    const aesKey = sharedSecret.substring(0, 64); // 32 bytes em hex
    console.log(" Chave AES derivada:", aesKey.substring(0, 16) + "...");
    return aesKey;
  }

  static async encryptAES(text, key) {
    console.log(" Criptografando mensagem com AES");
    console.log(" Texto original:", text);
    console.log(" Chave AES:", key.substring(0, 16) + "...");

    // Simulação de criptografia AES
    // Em produção, usar Web Crypto API
    const iv = this.generateRandomHex(16);

    // Simulação simples de "criptografia" - apenas para demonstração
    let encrypted = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }

    const encryptedBase64 = btoa(encrypted);
    const result = iv + ":" + encryptedBase64;

    console.log(" Texto criptografado:", result.substring(0, 30) + "...");
    return result;
  }

  static async decryptAES(encryptedText, key) {
    console.log(" Descriptografando mensagem com AES");
    console.log(
      " Texto criptografado:",
      encryptedText.substring(0, 30) + "..."
    );
    console.log(" Chave AES:", key.substring(0, 16) + "...");

    try {
      const [iv, encryptedBase64] = encryptedText.split(":");

      // Simulação simples de "descriptografia"
      const encrypted = atob(encryptedBase64);
      let decrypted = "";

      for (let i = 0; i < encrypted.length; i++) {
        const charCode =
          encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }

      console.log(" Texto descriptografado:", decrypted);
      return decrypted;
    } catch (error) {
      console.error(" Erro ao descriptografar:", error);
      return "[Mensagem criptografada - erro na descriptografia]";
    }
  }

  // Utilitários
  static generateRandomHex(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  static async sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

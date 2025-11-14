import mongoose from "mongoose";
import dotenv from "dotenv";

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const connectDatabase = async () => {
  try {
    // Obter a URL do MongoDB a partir das variáveis de ambiente
    const uri = process.env.DATABASE_URL;

    if (!uri) {
      throw new Error(
        "DATABASE_URL não está definida nas variáveis de ambiente"
      );
    }

    // ✅ CONFIGURAÇÕES DE RECONEXÃO
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 segundos de timeout
      socketTimeoutMS: 45000, // 45 segundos de socket timeout
      maxPoolSize: 10, // Número máximo de conexões
      retryWrites: true,
      retryReads: true,
    };

    // Conectar ao MongoDB com opções
    await mongoose.connect(uri, options);

    // ✅ NOME REAL DA BASE DE DADOS (da conexão)
    const dbName = mongoose.connection.db?.databaseName || "Desconhecida";

    // ✅ MENSAGEM CLARA DE CONEXÃO
    console.log(`✅ Conectado à Base de Dados MongoDB: "${dbName}"`);
    console.log(`✅ Servidor MongoDB: ${mongoose.connection.host}`);
    console.log(`✅ Porta MongoDB: ${mongoose.connection.port}`);
  } catch (error) {
    console.error("❌ Erro de conexão com a base de dados:", error);
    process.exit(1); // Encerra o processo com um código de erro
  }
};

// ✅ HANDLERS PARA RECONEXÃO AUTOMÁTICA
mongoose.connection.on("disconnected", () => {
  console.log("🔄 MongoDB desconectado, tentando reconectar...");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Erro de conexão MongoDB:", err);
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconectado com sucesso");
});

export default connectDatabase;

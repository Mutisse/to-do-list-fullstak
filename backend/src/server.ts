import express from "express";
import connectDatabase from "./app";
import routes from "./routes/tarefasroutes"; // Corrigido para tarefasRoutes
import dotenv from "dotenv";
import cors from "cors";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Conectar ao banco de dados
connectDatabase();

// Configuração do Express
app.use(cors()); // Permite requisições de qualquer origem
app.use(express.json()); // Para interpretar JSON nas requisições
app.use("/api", routes); // Prefixar as rotas com "/api"

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

import express from "express";
import connectDatabase from "./app";
import routes from "./routes/tarefasroutes";
import dotenv from "dotenv";
import cors from "cors";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Conectar ao banco de dados
connectDatabase();

// ✅ APENAS PRODUÇÃO
app.use(
  cors({
    origin: "https://tudolistfrontend.netlify.app", // APENAS SEU FRONTEND
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Configuração do Express
app.use(express.json());
app.use("/api", routes);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

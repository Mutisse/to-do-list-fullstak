"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_1 = __importDefault(require("./app"));
const tarefasroutes_1 = __importDefault(require("./routes/tarefasroutes")); // Corrigido para tarefasRoutes
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Carregar variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
// Conectar ao banco de dados
(0, app_1.default)();
// Configuração do Express
app.use((0, cors_1.default)()); // Permite requisições de qualquer origem
app.use(express_1.default.json()); // Para interpretar JSON nas requisições
app.use("/api", tarefasroutes_1.default); // Prefixar as rotas com "/api"
// No seu server.ts
app.use((0, cors_1.default)({
    origin: [
        "https://tudolistfrontend.netlify.app/" // Produção
    ],
    credentials: true
}));
// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

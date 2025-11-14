"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Carregar variáveis de ambiente do arquivo .env
dotenv_1.default.config();
const connectDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obter a URL do MongoDB a partir das variáveis de ambiente
        const uri = process.env.DATABASE_URL;
        if (!uri) {
            throw new Error("DATABASE_URL is not defined in environment variables");
        }
        // Extrair o nome da base de dados da URL
        const dbName = uri.split("/").pop(); // Assume que o nome da base de dados está no final da URL
        // Conectar ao MongoDB
        yield mongoose_1.default.connect(uri);
        // Logar a mensagem de sucesso com o nome da base de dados
        console.log(`Connected to Database "${dbName}" successfully`);
    }
    catch (error) {
        console.error("Database connection error:", error);
        process.exit(1); // Encerra o processo com um código de erro
    }
});
exports.default = connectDatabase;

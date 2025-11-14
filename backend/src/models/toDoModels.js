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
const tarefaSchema = new mongoose_1.default.Schema({
    _id: {
        type: String,
        required: true,
        unique: true // Garantir que o _id seja único
    },
    descricao: {
        type: String,
        required: true,
    },
    estado: {
        type: Boolean,
        default: false,
    },
    dataCriacao: {
        type: String,
        default: function () {
            const options = {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
            };
            return new Date().toLocaleDateString("pt-BR", options);
        },
    },
});
// Middleware de pré-validação para gerar o código de usuário
tarefaSchema.pre("validate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && !this._id) {
            let uniqueCodeFound = false;
            while (!uniqueCodeFound) {
                const randomCode = Math.floor(1000 + Math.random() * 9000); // Gera um número de 4 dígitos
                const userId = `T${randomCode}`;
                // Verifica se o código já existe
                const existingTarefa = yield mongoose_1.default
                    .model("tarefas")
                    .findOne({ _id: userId });
                if (!existingTarefa) {
                    this._id = userId;
                    uniqueCodeFound = true;
                }
            }
        }
        next();
    });
});
exports.default = mongoose_1.default.model("tarefas", tarefaSchema);

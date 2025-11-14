"use strict";
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
tarefaSchema.pre("validate", async function (next) {
    if (this.isNew && !this._id) {
        let uniqueCodeFound = false;
        while (!uniqueCodeFound) {
            const randomCode = Math.floor(1000 + Math.random() * 9000); // Gera um número de 4 dígitos
            const userId = `T${randomCode}`;
            // Verifica se o código já existe
            const existingTarefa = await mongoose_1.default
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
exports.default = mongoose_1.default.model("tarefas", tarefaSchema);

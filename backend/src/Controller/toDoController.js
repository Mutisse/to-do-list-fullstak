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
const toDoModels_1 = __importDefault(require("../models/toDoModels"));
class toDoController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descricao } = req.body;
            try {
                const tarefa = yield toDoModels_1.default.create({ descricao });
                return res.status(201).json(tarefa);
            }
            catch (error) {
                console.error(error);
                if (error instanceof Error) {
                    return res.status(500).json({
                        error: "Falha ao criar tarefa",
                        message: error.message,
                    });
                }
                return res.status(500).json({
                    error: "Erro desconhecido",
                    message: "Algo deu errado, tente novamente.",
                });
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { descricao, estado } = req.body;
            try {
                const tarefaAtualizada = yield toDoModels_1.default.findByIdAndUpdate(id, { descricao, estado }, { new: true, runValidators: true });
                if (!tarefaAtualizada) {
                    return res.status(404).json({
                        error: "Tarefa não encontrada",
                        message: `Nenhuma tarefa encontrada com o ID: ${id}`,
                    });
                }
                return res.status(200).json(tarefaAtualizada);
            }
            catch (error) {
                console.error("Erro ao atualizar tarefa:", error);
                if (error instanceof Error) {
                    return res.status(500).json({
                        error: "Algo deu errado, tente novamente.",
                        message: error.message,
                    });
                }
                return res.status(500).json({
                    error: "Erro desconhecido",
                    message: "Algo deu errado, tente novamente.",
                });
            }
        });
    }
    find(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tarefas = yield toDoModels_1.default.find().select('descricao estado createdAt dataCriacao');
                return res.status(200).json(tarefas);
            }
            catch (error) {
                if (error instanceof Error) {
                    return res.status(500).json({
                        error: "Falha ao buscar tarefas",
                        message: error.message,
                    });
                }
                return res.status(500).json({
                    error: "Erro desconhecido",
                    message: "Algo deu errado, tente novamente.",
                });
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const tarefaDeletada = yield toDoModels_1.default.findByIdAndDelete(id);
                if (!tarefaDeletada) {
                    return res.status(404).json({
                        error: "Tarefa não encontrada",
                        message: `Nenhuma tarefa encontrada com o ID: ${id}`,
                    });
                }
                return res.status(200).json({
                    message: "Tarefa deletada com sucesso",
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    return res.status(500).json({
                        error: "Falha ao deletar tarefa",
                        message: error.message,
                    });
                }
                return res.status(500).json({
                    error: "Erro desconhecido",
                    message: "Algo deu errado, tente novamente.",
                });
            }
        });
    }
    // Atualiza o status da tarefa
    updateStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { status } = req.body;
            try {
                const tarefa = yield toDoModels_1.default.findByIdAndUpdate(id, { status }, { new: true } // Retorna o documento atualizado
                );
                if (!tarefa) {
                    return res.status(404).json({ error: "Tarefa não encontrada" });
                }
                return res.status(200).json(tarefa);
            }
            catch (error) {
                if (error instanceof Error) {
                    return res.status(500).json({
                        error: "Falha ao atualizar status da tarefa",
                        message: error.message,
                    });
                }
                return res.status(500).json({
                    error: "Erro desconhecido",
                    message: "Algo deu errado, tente novamente.",
                });
            }
        });
    }
}
exports.default = new toDoController();

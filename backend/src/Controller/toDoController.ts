import { Request, Response } from "express";
import Tarefa from "../models/toDoModels";

class toDoController {
  async create(req: Request, res: Response) {
    const { descricao } = req.body;

    try {
      const tarefa = await Tarefa.create({ descricao });
      return res.status(201).json(tarefa);
    } catch (error) {
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
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { descricao, estado } = req.body;

    try {
      const tarefaAtualizada = await Tarefa.findByIdAndUpdate(
        id,
        { descricao, estado },
        { new: true, runValidators: true }
      );

      if (!tarefaAtualizada) {
        return res.status(404).json({
          error: "Tarefa não encontrada",
          message: `Nenhuma tarefa encontrada com o ID: ${id}`,
        });
      }

      return res.status(200).json(tarefaAtualizada);
    } catch (error) {
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
  }
  async find(req: Request, res: Response) {
    try {
      const tarefas = await Tarefa.find().select('descricao estado createdAt dataCriacao');
      
      return res.status(200).json(tarefas);
    } catch (error) {
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
  }
  
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const tarefaDeletada = await Tarefa.findByIdAndDelete(id);

      if (!tarefaDeletada) {
        return res.status(404).json({
          error: "Tarefa não encontrada",
          message: `Nenhuma tarefa encontrada com o ID: ${id}`,
        });
      }

      return res.status(200).json({
        message: "Tarefa deletada com sucesso",
      });
    } catch (error) {
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
  }

  // Atualiza o status da tarefa
  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const tarefa = await Tarefa.findByIdAndUpdate(
        id,
        { status },
        { new: true } // Retorna o documento atualizado
      );
      if (!tarefa) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }
      return res.status(200).json(tarefa);
    } catch (error) {
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
  }
}

export default new toDoController();

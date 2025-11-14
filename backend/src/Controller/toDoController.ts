import { Request, Response } from "express";
import Tarefa from "../models/toDoModels";

class toDoController {
  // Criar tarefa com todos os campos
  async create(req: Request, res: Response) {
    const {
      descricao,
      responsavel = null,
      dataInicio = null,
      dataTermino = null,
      status = "pendente",
    } = req.body;

    try {
      const tarefaData: any = {
        descricao,
        responsavel,
        status,
      };

      // Converte datas se fornecidas
      if (dataInicio) tarefaData.dataInicio = new Date(dataInicio);
      if (dataTermino) tarefaData.dataTermino = new Date(dataTermino);

      const tarefa = await Tarefa.create(tarefaData);
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

  // Atualizar tarefa completa
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { descricao, estado, responsavel, dataInicio, dataTermino, status } =
      req.body;

    try {
      const updateData: any = {
        descricao,
        responsavel,
      };

      // Converte datas se fornecidas
      if (dataInicio !== undefined) {
        updateData.dataInicio = dataInicio ? new Date(dataInicio) : null;
      }
      if (dataTermino !== undefined) {
        updateData.dataTermino = dataTermino ? new Date(dataTermino) : null;
      }

      // Mantém compatibilidade com o campo estado antigo
      if (estado !== undefined) {
        updateData.estado = estado;
        // Se estiver atualizando estado, também atualiza status
        if (status === undefined) {
          updateData.status = estado ? "concluida" : "pendente";
        }
      }

      // Atualiza status se fornecido
      if (status !== undefined) {
        updateData.status = status;
        // Mantém compatibilidade com estado
        updateData.estado = status === "concluida";
      }

      const tarefaAtualizada = await Tarefa.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

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

  // Buscar tarefas com filtros
  async find(req: Request, res: Response) {
    try {
      const { status, responsavel, search } = req.query;

      const filters: any = {};
      if (status && status !== "all") filters.status = status;
      if (responsavel) filters.responsavel = responsavel;
      if (search) filters.search = search;

      const tarefas = await (Tarefa as any).findWithFilters(filters);

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

  // Soft delete
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const tarefa = await Tarefa.findById(id);

      if (!tarefa) {
        return res.status(404).json({
          error: "Tarefa não encontrada",
          message: `Nenhuma tarefa encontrada com o ID: ${id}`,
        });
      }

      if ((tarefa as any).deletado) {
        return res.status(400).json({
          error: "Tarefa já deletada",
          message: "Esta tarefa já foi deletada anteriormente.",
        });
      }

      await (tarefa as any).softDelete();

      return res.status(200).json({
        message: "Tarefa deletada com sucesso",
        dataDelecao: (tarefa as any).dataDelecao,
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

  // Atualizar apenas o status
  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const updateData: any = { status };
      updateData.estado = status === "concluida"; // Mantém compatibilidade

      const tarefa = await Tarefa.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!tarefa) {
        return res.status(404).json({
          error: "Tarefa não encontrada",
          message: `Nenhuma tarefa encontrada com o ID: ${id}`,
        });
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

  // Buscar tarefas deletadas (apenas para admin)
  async findDeleted(req: Request, res: Response) {
    try {
      const tarefas = await Tarefa.find({ deletado: true })
        .select("descricao status dataCriacao dataDelecao")
        .sort({ dataDelecao: -1 });

      return res.status(200).json(tarefas);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Falha ao buscar tarefas deletadas",
          message: error.message,
        });
      }
      return res.status(500).json({
        error: "Erro desconhecido",
        message: "Algo deu errado, tente novamente.",
      });
    }
  }

  // Restaurar tarefa deletada
  async restore(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const tarefa = await Tarefa.findOne({ _id: id, deletado: true });

      if (!tarefa) {
        return res.status(404).json({
          error: "Tarefa deletada não encontrada",
          message: `Nenhuma tarefa deletada encontrada com o ID: ${id}`,
        });
      }

      await (tarefa as any).restore();

      return res.status(200).json({
        message: "Tarefa restaurada com sucesso",
        tarefa: {
          _id: tarefa._id,
          descricao: tarefa.descricao,
          status: (tarefa as any).status,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Falha ao restaurar tarefa",
          message: error.message,
        });
      }
      return res.status(500).json({
        error: "Erro desconhecido",
        message: "Algo deu errado, tente novamente.",
      });
    }
  }

  // Deletar permanentemente (hard delete)
  async hardDelete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const tarefaDeletada = await Tarefa.findOneAndDelete({
        _id: id,
        deletado: true,
      });

      if (!tarefaDeletada) {
        return res.status(404).json({
          error: "Tarefa não encontrada",
          message: `Nenhuma tarefa deletada encontrada com o ID: ${id}`,
        });
      }

      return res.status(200).json({
        message: "Tarefa excluída permanentemente",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Falha ao excluir tarefa permanentemente",
          message: error.message,
        });
      }
      return res.status(500).json({
        error: "Erro desconhecido",
        message: "Algo deu errado, tente novamente.",
      });
    }
  }

  // Estatísticas das tarefas
  async getStats(req: Request, res: Response) {
    try {
      const total = await Tarefa.countDocuments({ deletado: false });
      const concluidas = await Tarefa.countDocuments({
        deletado: false,
        status: "concluida",
      });
      const pendentes = await Tarefa.countDocuments({
        deletado: false,
        status: "pendente",
      });
      const andamento = await Tarefa.countDocuments({
        deletado: false,
        status: "andamento",
      });
      const canceladas = await Tarefa.countDocuments({
        deletado: false,
        status: "cancelada",
      });

      // Tarefas atrasadas
      const agora = new Date();
      const atrasadas = await Tarefa.countDocuments({
        deletado: false,
        status: { $in: ["pendente", "andamento"] },
        dataTermino: { $lt: agora },
      });

      // Tarefas próximas do prazo (próximos 3 dias)
      const tresDias = new Date();
      tresDias.setDate(tresDias.getDate() + 3);
      const proximas = await Tarefa.countDocuments({
        deletado: false,
        status: { $in: ["pendente", "andamento"] },
        dataTermino: {
          $gte: agora,
          $lte: tresDias,
        },
      });

      const completionRate = total > 0 ? (concluidas / total) * 100 : 0;

      return res.status(200).json({
        total,
        concluidas,
        pendentes,
        andamento,
        canceladas,
        atrasadas,
        proximas,
        completionRate: Math.round(completionRate),
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Falha ao buscar estatísticas",
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

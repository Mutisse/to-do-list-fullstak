import mongoose from "mongoose";
import { ITarefa, ITarefaModel } from "./ITarefa";

const tarefaSchema = new mongoose.Schema<ITarefa>({
  _id: {
    type: String,
    required: true,
    // Removemos unique: true pois o MongoDB já garante isso automaticamente
  },
  descricao: {
    type: String,
    required: true,
  },
  estado: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["pendente", "andamento", "concluida", "cancelada"],
    default: "pendente",
  },
  responsavel: {
    type: String,
    default: null,
  },
  dataInicio: {
    type: Date,
    default: null,
  },
  dataTermino: {
    type: Date,
    default: null,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
  deletado: {
    type: Boolean,
    default: false,
  },
  dataDelecao: {
    type: Date,
    default: null,
  },
});

// Middleware de pré-validação para gerar o código da tarefa
tarefaSchema.pre("validate", async function (next) {
  if (this.isNew && !this._id) {
    let uniqueCodeFound = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!uniqueCodeFound && attempts < maxAttempts) {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const taskId = `T${randomCode}`;

      const existingTarefa = await TarefaModel.findOne({
        _id: taskId,
        deletado: false,
      });

      if (!existingTarefa) {
        this._id = taskId;
        uniqueCodeFound = true;
      }
      attempts++;
    }

    if (!uniqueCodeFound) {
      return next(
        new Error("Não foi possível gerar um ID único para a tarefa")
      );
    }
  }
  next();
});

// Middleware para queries - excluir tarefas deletadas por padrão
tarefaSchema.pre(/^find/, function (next) {
  // Usando type assertion para acessar métodos do Query
  const query: any = this as any;

  // Só aplica se não estiver explicitamente buscando deletados
  if (!query._conditions.includeDeleted) {
    query.where({ deletado: false });
  }
  next();
});

// Índices para performance - REMOVEMOS o índice do _id
tarefaSchema.index({ deletado: 1, status: 1 });
tarefaSchema.index({ deletado: 1, dataTermino: 1 });
tarefaSchema.index({ deletado: 1, responsavel: 1 });
// Índice composto para buscas frequentes
tarefaSchema.index({ deletado: 1, status: 1, dataTermino: 1 });

// Método estático para buscar tarefas com filtros
tarefaSchema.statics.findWithFilters = function (filters = {}) {
  const query: any = { deletado: false };

  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }

  if (filters.responsavel) {
    query.responsavel = filters.responsavel;
  }

  if (filters.search) {
    query.descricao = { $regex: filters.search, $options: "i" };
  }

  return this.find(query).sort({ dataCriacao: -1 });
};

// Método para soft delete
tarefaSchema.methods.softDelete = function () {
  (this as any).deletado = true;
  (this as any).dataDelecao = new Date();
  return (this as any).save();
};

// Método para restaurar tarefa
tarefaSchema.methods.restore = function () {
  (this as any).deletado = false;
  (this as any).dataDelecao = null;
  return (this as any).save();
};

// Virtual para verificar se está atrasada
tarefaSchema.virtual("atrasada").get(function () {
  if ((this as any).status === "concluida" || !(this as any).dataTermino)
    return false;
  return new Date((this as any).dataTermino) < new Date();
});

// Virtual para tempo restante
tarefaSchema.virtual("tempoRestante").get(function () {
  if (!(this as any).dataTermino) return null;
  const agora = new Date();
  const termino = new Date((this as any).dataTermino);
  return termino.getTime() - agora.getTime();
});

const TarefaModel = mongoose.model<ITarefa, ITarefaModel>(
  "tarefas",
  tarefaSchema
);
export default TarefaModel;

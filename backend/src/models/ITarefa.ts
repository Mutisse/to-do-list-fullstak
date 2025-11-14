import { Document, Model } from "mongoose";

export interface ITarefa extends Document {
  _id: string;
  descricao: string;
  estado: boolean;
  status: "pendente" | "andamento" | "concluida" | "cancelada";
  responsavel: string | null;
  dataInicio: Date | null;
  dataTermino: Date | null;
  dataCriacao: Date;
  deletado: boolean;
  dataDelecao: Date | null;

  // Métodos de instância
  softDelete(): Promise<ITarefa>;
  restore(): Promise<ITarefa>;

  // Virtuals
  atrasada: boolean;
  tempoRestante: number | null;
}

// Interface para métodos estáticos
export interface ITarefaModel extends Model<ITarefa> {
  findWithFilters(filters?: any): Promise<ITarefa[]>;
}

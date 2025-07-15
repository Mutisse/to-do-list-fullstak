import mongoose from "mongoose";

const tarefaSchema = new mongoose.Schema({
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
      const options: Intl.DateTimeFormatOptions = {
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
      const existingTarefa = await mongoose
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

export default mongoose.model("tarefas", tarefaSchema);


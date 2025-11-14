<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalhes da Tarefa</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- Descrição -->
        <div class="form-group">
          <label>Descrição da Tarefa</label>
          <textarea
            v-model="localTask.descricao"
            class="task-description"
            rows="3"
            placeholder="Descreva a tarefa..."
          ></textarea>
        </div>

        <!-- Responsável -->
        <div class="form-group">
          <label>Responsável</label>
          <select v-model="localTask.responsavel" class="form-select">
            <option value="">Selecione um responsável</option>
            <option
              v-for="responsavel in responsaveis"
              :key="responsavel._id"
              :value="responsavel._id"
            >
              {{ responsavel.nome }} ({{ responsavel.email }})
            </option>
          </select>
        </div>

        <!-- Status -->
        <div class="form-group">
          <label>Status</label>
          <select v-model="localTask.status" class="form-select">
            <option value="pendente">⏳ Pendente</option>
            <option value="andamento">🚀 Em Andamento</option>
            <option value="concluida">✅ Concluída</option>
            <option value="cancelada">❌ Cancelada</option>
          </select>
        </div>

        <!-- Datas -->
        <div class="dates-container">
          <div class="form-group">
            <label>Data de Início</label>
            <input
              type="datetime-local"
              v-model="localTask.dataInicio"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Data de Término</label>
            <input
              type="datetime-local"
              v-model="localTask.dataTermino"
              class="form-input"
              :class="{ 'input-error': isAtrasada }"
            />
            <small v-if="isAtrasada" class="error-text">
              ⚠️ Tarefa atrasada!
            </small>
          </div>
        </div>

        <!-- Informações de Prazo -->
        <div v-if="localTask.dataTermino" class="deadline-info">
          <div class="info-item">
            <span class="info-label">Tempo Restante:</span>
            <span :class="['info-value', tempoRestanteClass]">
              {{ tempoRestante }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Status do Prazo:</span>
            <span :class="['info-value', statusPrazoClass]">
              {{ statusPrazo }}
            </span>
          </div>
        </div>

        <!-- Data de Criação (somente leitura) -->
        <div class="form-group" v-if="localTask.dataCriacao">
          <label>Data de Criação</label>
          <input
            type="text"
            :value="formatDate(localTask.dataCriacao)"
            class="form-input"
            disabled
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
        <button
          class="btn btn-danger"
          @click="deleteTask"
          v-if="taskIndex !== null"
        >
          Excluir Tarefa
        </button>
        <button
          class="btn btn-primary"
          @click="saveChanges"
          :disabled="!isValid"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useTodoStore } from "../stores/todoStore";

export default {
  props: {
    show: Boolean,
    task: Object,
    taskIndex: Number,
  },

  data() {
    return {
      localTask: {},
      responsaveis: [],
    };
  },

  computed: {
    isValid() {
      return this.localTask.descricao && this.localTask.descricao.trim() !== "";
    },

    isAtrasada() {
      if (
        !this.localTask.dataTermino ||
        this.localTask.status === "concluida"
      ) {
        return false;
      }
      return new Date(this.localTask.dataTermino) < new Date();
    },

    tempoRestante() {
      if (!this.localTask.dataTermino) return "Não definido";

      const agora = new Date();
      const termino = new Date(this.localTask.dataTermino);
      const diff = termino - agora;

      if (diff <= 0) return "Expirado";

      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (dias > 0) return `${dias}d ${horas}h`;
      return `${horas}h`;
    },

    tempoRestanteClass() {
      if (!this.localTask.dataTermino) return "info-neutral";

      const agora = new Date();
      const termino = new Date(this.localTask.dataTermino);
      const diff = termino - agora;
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (diff <= 0) return "info-danger";
      if (dias < 2) return "info-warning";
      return "info-success";
    },

    statusPrazo() {
      if (!this.localTask.dataTermino) return "Não definido";

      if (this.localTask.status === "concluida")
        return "Concluída dentro do prazo";
      if (this.isAtrasada) return "Atrasada";

      const agora = new Date();
      const termino = new Date(this.localTask.dataTermino);
      const diff = termino - agora;
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (dias < 2) return "Próximo do prazo";
      return "No prazo";
    },

    statusPrazoClass() {
      if (!this.localTask.dataTermino) return "info-neutral";

      if (this.localTask.status === "concluida") return "info-success";
      if (this.isAtrasada) return "info-danger";

      const agora = new Date();
      const termino = new Date(this.localTask.dataTermino);
      const diff = termino - agora;
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (dias < 2) return "info-warning";
      return "info-success";
    },
  },

  watch: {
    task: {
      handler(newTask) {
        if (newTask) {
          this.localTask = { ...newTask };
        }
      },
      immediate: true,
    },

    show(newVal) {
      if (newVal) {
        this.loadResponsaveis();
      }
    },
  },

  methods: {
    async loadResponsaveis() {
      const store = useTodoStore();
      await store.fetchResponsaveis();
      this.responsaveis = store.responsaveis;
    },

    formatDate(dateString) {
      if (!dateString) return "Data inválida";

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Data inválida";

        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        return "Data inválida";
      }
    },

    closeModal() {
      this.$emit("close");
    },

    async saveChanges() {
      if (!this.isValid) {
        alert("Por favor, preencha a descrição da tarefa!");
        return;
      }

      try {
        const store = useTodoStore();

        if (this.taskIndex === null) {
          // Nova tarefa
          await store.addTodo(
            this.localTask.descricao,
            this.localTask.responsavel || null,
            this.localTask.dataInicio || null,
            this.localTask.dataTermino || null,
            this.localTask.status || "pendente"
          );
        } else {
          // Tarefa existente
          await store.updateTodo(
            this.taskIndex,
            this.localTask.descricao,
            this.localTask.responsavel || null,
            this.localTask.dataInicio || null,
            this.localTask.dataTermino || null,
            this.localTask.status || "pendente"
          );
        }

        this.$emit("saved");
        this.closeModal();
      } catch (error) {
        alert("Erro ao salvar tarefa: " + error.message);
      }
    },

    async deleteTask() {
      if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        try {
          const store = useTodoStore();
          await store.deleteTodo(this.taskIndex);
          this.$emit("deleted");
          this.closeModal();
        } catch (error) {
          alert("Erro ao excluir tarefa: " + error.message);
        }
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: #e74c3c;
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.task-description,
.form-select,
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.task-description:focus,
.form-select:focus,
.form-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-input:disabled {
  background: #f8f9fa;
  color: #7f8c8d;
  cursor: not-allowed;
}

.input-error {
  border-color: #e74c3c !important;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.dates-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.deadline-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: #2c3e50;
}

.info-value {
  font-weight: 600;
}

.info-success {
  color: #27ae60;
}
.info-warning {
  color: #f39c12;
}
.info-danger {
  color: #e74c3c;
}
.info-neutral {
  color: #7f8c8d;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: 85vh;
  }

  .dates-container {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>

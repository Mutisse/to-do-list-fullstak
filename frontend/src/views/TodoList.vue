<template>
  <div class="container">
    <!-- Notificação -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>

    <!-- Modal de Detalhes -->
    <TaskDetailsModal
      :show="showModal"
      :task="selectedTask"
      :taskIndex="selectedTaskIndex"
      @close="closeModal"
      @saved="handleTaskSaved"
      @deleted="handleTaskDeleted"
    />

    <!-- Barra de ferramentas -->
    <div class="toolbar">
      <div class="input-container">
        <input
          v-model="input"
          class="input-task"
          placeholder="Digite sua tarefa..."
          @keypress.enter="adicionarTarefaRapida"
        />
       
        <button class="button-details" @click="abrirModalNovaTarefa">
          📋 Nova Tarefa 
        </button>
      </div>

      <div class="filters-container">
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">📋 Todas</option>
            <option value="pendente">⏳ Pendentes</option>
            <option value="andamento">🚀 Em Andamento</option>
            <option value="concluida">✅ Concluídas</option>
            <option value="cancelada">❌ Canceladas</option>
          </select>

          <select v-model="responsavelFilter" class="filter-select">
            <option value="">👤 Todos os responsáveis</option>
            <option 
              v-for="resp in responsaveis" 
              :key="resp._id" 
              :value="resp._id"
            >
              {{ resp.nome }}
            </option>
          </select>

          <input
            v-model="searchTerm"
            placeholder="🔍 Buscar tarefas..."
            class="search-input"
          />

          <button @click="clearFilters" class="clear-filters-btn">
            🗑️ Limpar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estatísticas Avançadas -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" style="color: #27ae60">{{ stats.concluidas }}</span>
        <span class="stat-label">Concluídas</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" style="color: #e74c3c">{{ stats.pendentes }}</span>
        <span class="stat-label">Pendentes</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" style="color: #f39c12">{{ stats.emAndamento }}</span>
        <span class="stat-label">Em Andamento</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" style="color: #e74c3c">{{ stats.atrasadas }}</span>
        <span class="stat-label">Atrasadas</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" style="color: #3498db">{{ stats.completionRate }}%</span>
        <span class="stat-label">Conclusão</span>
      </div>
    </div>

    <!-- Alertas -->
    <div v-if="tarefasAtrasadas.length > 0" class="alert alert-warning">
      ⚠️ <strong>{{ tarefasAtrasadas.length }} tarefa(s) atrasada(s)</strong>
      <button @click="filtrarAtrasadas" class="alert-btn">Ver Tarefas</button>
    </div>

    <div v-if="tarefasProximas.length > 0" class="alert alert-info">
      🔔 <strong>{{ tarefasProximas.length }} tarefa(s) próxima(s) do prazo</strong>
      <button @click="filtrarProximas" class="alert-btn">Ver Tarefas</button>
    </div>

    <!-- Tabela para dispositivos grandes -->
    <div class="table-container" v-if="windowWidth > 768">
      <table class="tasks-table">
        <thead>
          <tr>
            <th class="status-col">Status</th>
            <th class="task-col">Tarefa</th>
            <th class="responsavel-col">Responsável</th>
            <th class="dates-col">Prazos</th>
            <th class="actions-col">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in filteredTodos"
            :key="item._id"
            :class="getTaskRowClass(item)"
            @click="abrirModalEdicao(item, index)"
          >
            <td class="status-cell">
              <span class="status-badge" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td class="task-cell">
              <div class="task-main">
                <span class="task-text">{{ item.descricao }}</span>
                <div class="task-meta">
                  <span class="creation-date">Criada: {{ formatDate(item.dataCriacao) }}</span>
                </div>
              </div>
            </td>
            <td class="responsavel-cell">
              <span v-if="getResponsavelNome(item.responsavel)" class="responsavel-info">
                👤 {{ getResponsavelNome(item.responsavel) }}
              </span>
              <span v-else class="no-responsavel">Sem responsável</span>
            </td>
            <td class="dates-cell">
              <div class="dates-info">
                <div v-if="item.dataInicio" class="date-item">
                  <span class="date-label">Início:</span>
                  <span class="date-value">{{ formatDate(item.dataInicio) }}</span>
                </div>
                <div v-if="item.dataTermino" class="date-item">
                  <span class="date-label">Término:</span>
                  <span class="date-value" :class="getPrazoClass(item)">
                    {{ formatDate(item.dataTermino) }}
                    <span v-if="isAtrasada(item)" class="atraso-indicator">⚠️</span>
                  </span>
                </div>
                <div v-if="!item.dataTermino" class="no-deadline">
                  Sem prazo definido
                </div>
              </div>
            </td>
            <td class="actions-cell">
              <button
                class="edit-btn"
                @click.stop="abrirModalEdicao(item, index)"
                title="Editar tarefa"
              >
                ✏️
              </button>
              <button
                class="delete-btn"
                @click.stop="deletarItem(index)"
                title="Excluir tarefa"
              >
                🗑️
              </button>
              <button
                v-if="item.status !== 'concluida'"
                class="complete-btn"
                :class="{ 'disabled-btn': !item.responsavel }"
                @click.stop="marcarComoConcluida(index)"
                :title="!item.responsavel ? 'Atribua um responsável para concluir' : 'Marcar como concluída'"
                :disabled="!item.responsavel"
              >
                ✅
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Lista para dispositivos móveis -->
    <ul class="list-tasks" v-else>
      <li
        v-for="(item, index) in filteredTodos"
        :key="item._id"
        class="task-card"
        :class="getTaskCardClass(item)"
        @click="abrirModalEdicao(item, index)"
      >
        <div class="task-header">
          <span class="status-badge" :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </span>
          <div class="task-actions">
            <button
              class="action-btn edit-btn"
              @click.stop="abrirModalEdicao(item, index)"
              title="Editar"
            >
              ✏️
            </button>
            <button
              class="action-btn delete-btn"
              @click.stop="deletarItem(index)"
              title="Excluir"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="task-content">
          <p class="task-text">{{ item.descricao }}</p>
          
          <div class="task-details">
            <div v-if="getResponsavelNome(item.responsavel)" class="detail-item">
              <span class="detail-label">👤</span>
              <span class="detail-value">{{ getResponsavelNome(item.responsavel) }}</span>
            </div>
            
            <div v-if="item.dataInicio" class="detail-item">
              <span class="detail-label">📅 Início:</span>
              <span class="detail-value">{{ formatDateShort(item.dataInicio) }}</span>
            </div>
            
            <div v-if="item.dataTermino" class="detail-item">
              <span class="detail-label">⏰ Término:</span>
              <span class="detail-value" :class="getPrazoClass(item)">
                {{ formatDateShort(item.dataTermino) }}
                <span v-if="isAtrasada(item)" class="atraso-indicator">⚠️</span>
              </span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">🕒 Criada:</span>
              <span class="detail-value">{{ formatDateShort(item.dataCriacao) }}</span>
            </div>
          </div>
        </div>
        
        <div class="task-footer">
          <button
            v-if="item.status !== 'concluida'"
            class="complete-btn-mobile"
            :class="{ 'disabled-btn': !item.responsavel }"
            @click.stop="marcarComoConcluida(index)"
            :disabled="!item.responsavel"
          >
            {{ !item.responsavel ? '👤 Atribuir Responsável' : '✅ Concluir' }}
          </button>
        </div>
      </li>
    </ul>

    <!-- Mensagem quando não há tarefas -->
    <div v-if="filteredTodos.length === 0" class="empty-state">
      <p v-if="hasActiveFilters">
        🔍 Nenhuma tarefa encontrada com os filtros atuais
      </p>
      <p v-else>📝 Nenhuma tarefa encontrada</p>
      <p class="empty-subtitle">Adicione sua primeira tarefa acima!</p>
      <div class="empty-actions">
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="clear-filters-btn"
        >
          🗑️ Limpar Filtros
        </button>
        <button
          @click="abrirModalNovaTarefa"
          class="button-add-task"
        >
          ➕ Nova Tarefa Detalhada
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useTodoStore } from "../stores/todoStore";
import TaskDetailsModal from "../components/TaskDetailsModal.vue";

export default {
  name: 'TodoList',
  components: {
    TaskDetailsModal
  },
  
  data() {
    return {
      input: "",
      windowWidth: window.innerWidth,
      notification: {
        show: false,
        message: "",
        type: "success",
      },
      searchTerm: "",
      statusFilter: "all",
      responsavelFilter: "",
      showModal: false,
      selectedTask: null,
      selectedTaskIndex: null,
      responsaveis: []
    };
  },

  computed: {
    todos() {
      const store = useTodoStore();
      return store.todos;
    },

    filteredTodos() {
      const store = useTodoStore();
      return store.filteredTodos;
    },

    stats() {
      const store = useTodoStore();
      return store.stats;
    },

    tarefasAtrasadas() {
      const store = useTodoStore();
      return store.tarefasAtrasadas;
    },

    tarefasProximas() {
      const store = useTodoStore();
      return store.tarefasProximas;
    },

    hasActiveFilters() {
      return this.searchTerm || this.statusFilter !== 'all' || this.responsavelFilter;
    }
  },

  watch: {
    searchTerm(newSearch) {
      const store = useTodoStore();
      store.setFilter("search", newSearch);
    },

    statusFilter(newStatus) {
      const store = useTodoStore();
      store.setFilter("status", newStatus);
    },

    responsavelFilter(newResponsavel) {
      const store = useTodoStore();
      store.setFilter("responsavel", newResponsavel || null);
    }
  },

  methods: {
    showNotification(message, type = "success") {
      this.notification = {
        show: true,
        message,
        type,
      };

      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },

    // Métodos de formatação
    formatDate(dateString) {
      if (!dateString) return "Não definida";

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

    formatDateShort(dateString) {
      if (!dateString) return "Não definida";

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Data inválida";

        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
      } catch (error) {
        return "Data inválida";
      }
    },

    // Métodos de status e classes
    getStatusText(status) {
      const statusMap = {
        'pendente': '⏳ Pendente',
        'andamento': '🚀 Em Andamento',
        'concluida': '✅ Concluída',
        'cancelada': '❌ Cancelada'
      };
      return statusMap[status] || '⏳ Pendente';
    },

    getStatusClass(status) {
      const classMap = {
        'pendente': 'status-pendente',
        'andamento': 'status-andamento',
        'concluida': 'status-concluida',
        'cancelada': 'status-cancelada'
      };
      return classMap[status] || 'status-pendente';
    },

    getTaskRowClass(task) {
      const classes = [];
      if (task.status === 'concluida') classes.push('task-completed');
      if (this.isAtrasada(task)) classes.push('task-overdue');
      if (this.isProxima(task)) classes.push('task-upcoming');
      return classes;
    },

    getTaskCardClass(task) {
      const classes = ['task-card'];
      if (task.status === 'concluida') classes.push('task-completed');
      if (this.isAtrasada(task)) classes.push('task-overdue');
      if (this.isProxima(task)) classes.push('task-upcoming');
      return classes;
    },

    getPrazoClass(task) {
      if (task.status === 'concluida') return 'prazo-concluido';
      if (this.isAtrasada(task)) return 'prazo-atrasado';
      if (this.isProxima(task)) return 'prazo-proximo';
      return 'prazo-normal';
    },

    isAtrasada(task) {
      if (task.status === 'concluida' || !task.dataTermino) return false;
      return new Date(task.dataTermino) < new Date();
    },

    isProxima(task) {
      if (task.status === 'concluida' || !task.dataTermino) return false;
      const tresDias = new Date();
      tresDias.setDate(tresDias.getDate() + 3);
      return new Date(task.dataTermino) <= tresDias && new Date(task.dataTermino) >= new Date();
    },

    getResponsavelNome(responsavelId) {
      if (!responsavelId) return null;
      const store = useTodoStore();
      const responsavel = store.getResponsavelById(responsavelId);
      return responsavel ? responsavel.nome : null;
    },

    // Métodos de ações
    async adicionarTarefaRapida() {
      if (this.input.trim() === "") {
        this.showNotification("Por favor, digite uma tarefa!", "warning");
        return;
      }

      try {
        const store = useTodoStore();
        await store.addTodo(this.input);
        this.input = "";
        this.showNotification("Tarefa adicionada com sucesso!", "success");
      } catch (error) {
        this.showNotification("Erro ao adicionar tarefa!", "error");
      }
    },

    async marcarComoConcluida(index) {
      const task = this.todos[index];
      
      // Validação: verifica se a tarefa tem um responsável
      if (!task.responsavel) {
        this.showNotification("Não é possível concluir uma tarefa sem responsável! Por favor, atribua um responsável primeiro.", "warning");
        
        // Abre o modal de edição para que o usuário possa atribuir um responsável
        this.abrirModalEdicao(task, index);
        return;
      }

      // Validação adicional: confirmação para tarefas importantes
      if (this.isAtrasada(task) || this.isProxima(task)) {
        const confirmMessage = this.isAtrasada(task) 
          ? "Esta tarefa está atrasada. Tem certeza que deseja marcá-la como concluída?"
          : "Esta tarefa está próxima do prazo. Tem certeza que deseja marcá-la como concluída?";
        
        if (!confirm(confirmMessage)) {
          return;
        }
      }

      try {
        const store = useTodoStore();
        await store.updateTodoStatus(index, 'concluida');
        
        const responsavelNome = this.getResponsavelNome(task.responsavel);
        const mensagem = responsavelNome 
          ? `Tarefa concluída por ${responsavelNome}! 🎉`
          : "Tarefa concluída com sucesso!";
        
        this.showNotification(mensagem, "success");
      } catch (error) {
        this.showNotification("Erro ao concluir tarefa!", "error");
      }
    },

    async deletarItem(index) {
      if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        try {
          const store = useTodoStore();
          await store.deleteTodo(index);
          this.showNotification("Tarefa excluída com sucesso!", "success");
        } catch (error) {
          this.showNotification("Erro ao excluir tarefa!", "error");
        }
      }
    },

    // Métodos do modal
    abrirModalNovaTarefa() {
      this.selectedTask = {
        descricao: this.input || '',
        status: 'pendente',
        responsavel: null,
        dataInicio: null,
        dataTermino: null
      };
      this.selectedTaskIndex = null;
      this.showModal = true;
    },

    abrirModalEdicao(task, index) {
      this.selectedTask = { ...task };
      this.selectedTaskIndex = index;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.selectedTask = null;
      this.selectedTaskIndex = null;
    },

    handleTaskSaved() {
      this.showNotification("Tarefa salva com sucesso!", "success");
      this.closeModal();
    },

    handleTaskDeleted() {
      this.showNotification("Tarefa excluída com sucesso!", "success");
      this.closeModal();
    },

    // Métodos de filtros
    clearFilters() {
      this.searchTerm = "";
      this.statusFilter = "all";
      this.responsavelFilter = "";
      const store = useTodoStore();
      store.clearFilters();
      this.showNotification("Filtros limpos!", "success");
    },

    filtrarAtrasadas() {
      this.statusFilter = 'all';
      this.searchTerm = '';
      this.responsavelFilter = '';
      this.showNotification("Mostrando tarefas atrasadas", "warning");
    },

    filtrarProximas() {
      this.statusFilter = 'all';
      this.searchTerm = '';
      this.responsavelFilter = '';
      this.showNotification("Mostrando tarefas próximas do prazo", "info");
    },

    // Utilitários
    handleResize() {
      this.windowWidth = window.innerWidth;
    },

    async loadResponsaveis() {
      const store = useTodoStore();
      await store.fetchResponsaveis();
      this.responsaveis = store.responsaveis;
    }
  },

  async mounted() {
    const store = useTodoStore();
    await store.fetchTodos();
    await this.loadResponsaveis();
    
    window.addEventListener("resize", this.handleResize);

    this.$nextTick(() => {
      this.$el.querySelector(".input-task")?.focus();
    });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>



<style scoped>
/* ===== RESET E BASE ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  padding: 1rem 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, sans-serif;
  line-height: 1.4;
}

/* ===== NOTIFICAÇÕES ===== */
.notification {
  position: fixed;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification.success {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.notification.error {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.notification.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.notification.info {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

@keyframes slideIn {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ===== TOOLBAR MOBILE-FIRST ===== */
.toolbar {
  max-width: 1200px;
  margin: 0 auto 1.5rem;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.input-task {
  width: 100%;
  border: 2px solid #e1e8ed;
  border-radius: 16px;
  height: 56px;
  padding: 0 1.25rem;
  font-size: 1rem;
  color: #212121;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-task:focus {
  border-color: #27ae60;
  box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.15);
  transform: translateY(-2px);
}

.input-task::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.button-add-task,
.button-details {
  width: 100%;
  border: none;
  border-radius: 16px;
  height: 56px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 0 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button-add-task {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.button-details {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.button-add-task:active,
.button-details:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* ===== FILTROS OTIMIZADOS ===== */
.filters-container {
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e8ed;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-select,
.search-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.filter-select:focus,
.search-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.clear-filters-btn {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e74c3c;
  border-radius: 12px;
  background: white;
  color: #e74c3c;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.clear-filters-btn:active {
  background: #e74c3c;
  color: white;
  transform: scale(0.98);
}

/* ===== ESTATÍSTICAS MOBILE ===== */
.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  max-width: 1200px;
  margin: 0 auto 1.5rem;
}

.stat-item {
  background: white;
  padding: 1.25rem 1rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e8ed;
  transition: transform 0.2s ease;
}

.stat-item:active {
  transform: scale(0.95);
}

.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== ALERTAS MOBILE ===== */
.alert {
  max-width: 1200px;
  margin: 0 auto 1rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alert-warning {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 1px solid #ffd166;
  color: #856404;
}

.alert-info {
  background: linear-gradient(135deg, #d1ecf1, #bee5eb);
  border: 1px solid #67c8ff;
  color: #0c5460;
}

.alert-btn {
  padding: 0.75rem 1rem;
  border: 2px solid currentColor;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alert-btn:active {
  background: currentColor;
  color: #212121;
  transform: scale(0.95);
}

/* ===== LISTA MOBILE (PRINCIPAL) ===== */
.list-tasks {
  max-width: 800px;
  margin: 0 auto;
  list-style: none;
}

.task-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e1e8ed;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.task-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #3498db;
  transition: all 0.3s ease;
}

.task-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.task-card.task-completed::before {
  background: #27ae60;
}

.task-card.task-overdue::before {
  background: #e74c3c;
}

.task-card.task-upcoming::before {
  background: #f39c12;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

.status-badge {
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  display: inline-block;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.status-pendente {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
  border: 1px solid #ffd166;
}

.status-andamento {
  background: linear-gradient(135deg, #d1ecf1, #bee5eb);
  color: #0c5460;
  border: 1px solid #67c8ff;
}

.status-concluida {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #8fd19e;
}

.status-cancelada {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  border: 1px solid #f1aeb5;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  border: none;
  padding: 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: scale(0.9);
}

.edit-btn {
  background: #3498db;
  color: white;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.task-content {
  margin-bottom: 1.25rem;
}

.task-text {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  word-break: break-word;
  color: #212121;
  line-height: 1.4;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f7fafc;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #718096;
  font-weight: 600;
  min-width: 70px;
  flex-shrink: 0;
}

.detail-value {
  color: #2d3748;
  font-weight: 500;
  flex: 1;
}

.prazo-concluido {
  color: #27ae60;
}

.prazo-atrasado {
  color: #e74c3c;
  font-weight: 700;
}

.prazo-proximo {
  color: #f39c12;
  font-weight: 700;
}

.atraso-indicator {
  margin-left: 0.25rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.task-footer {
  display: flex;
  justify-content: center;
}

.complete-btn-mobile {
  width: 100%;
  border: none;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: #212121;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.complete-btn-mobile:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.4);
}

/* ===== ESTADO VAZIO ===== */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #718096;
  background: white;
  border-radius: 20px;
  max-width: 400px;
  margin: 2rem auto;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 2px dashed #e1e8ed;
}

.empty-state p {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #212121;
}

.empty-subtitle {
  font-size: 1rem !important;
  font-weight: 500 !important;
  opacity: 0.8;
  margin-bottom: 2rem !important;
  line-height: 1.5;
}

/* ===== TABELA (APENAS DESKTOP) ===== */
.table-container {
  display: none;
}

/* ===== MEDIA QUERIES PARA TELAS MAIORES ===== */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem 1rem;
  }

  .notification {
    left: auto;
    right: 1.5rem;
    max-width: 400px;
  }

  .input-container {
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .input-task {
    min-width: 200px;
  }

  .button-add-task,
  .button-details {
    width: auto;
    flex-shrink: 0;
  }

  .filter-group {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .filter-select {
    min-width: 140px;
    flex: 1;
  }

  .search-input {
    min-width: 200px;
    flex: 2;
  }

  .clear-filters-btn {
    width: auto;
    flex-shrink: 0;
  }

  .stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-item {
    padding: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .alert {
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
  }

  .list-tasks {
    display: none;
  }

  .table-container {
    display: block;
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e8ed;
  }

  .tasks-table {
    width: 100%;
    border-collapse: collapse;
  }

  .tasks-table th {
    background: linear-gradient(135deg, #2c3e50, #34495e);
    color: white;
    padding: 1.25rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.9rem;
    border-bottom: 2px solid #34495e;
  }

  .tasks-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f7fafc;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .tasks-table tr:hover td {
    background-color: #f8f9fa;
  }

  .tasks-table tr.task-overdue td {
    background-color: rgba(231, 76, 60, 0.05);
  }

  .tasks-table tr.task-upcoming td {
    background-color: rgba(243, 156, 18, 0.05);
  }
}

.disabled-btn {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.disabled-btn:active {
  transform: none !important;
}

@media (min-width: 1024px) {
  .container {
    padding: 2rem;
  }

  .stats {
    grid-template-columns: repeat(6, 1fr);
  }

  .input-container {
    margin-bottom: 2rem;
  }

  .filters-container {
    padding: 1.5rem;
  }
}

@media (min-width: 1200px) {
  .toolbar,
  .stats,
  .table-container,
  .alert {
    max-width: 1200px;
  }
}

/* ===== MELHORIAS DE ACESSIBILIDADE ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ===== MELHORIAS PARA DARK MODE ===== */
@media (prefers-color-scheme: dark) {
  .container {
    color: #e2e8f0;
  }

  .input-task,
  .filter-select,
  .search-input,
  .filters-container,
  .stat-item,
  .task-card,
  .empty-state,
  .table-container {
    background: #ffffffba;
    border-color: #4a5568;
    color: #212121;
  }

  .input-task::placeholder {
    color: #212121;
  }

  .task-text,
  .detail-value {
    color: #e2e8f0;
  }

  .detail-label,
  .stat-label,
  .empty-subtitle {
    color: #a0aec0;
  }
}
</style>

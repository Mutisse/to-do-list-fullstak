import { defineStore } from "pinia";
import http from "../http";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [],
    editIndex: null,
    filters: {
      categoria: null,
      status: "all",
      search: "",
      responsavel: null,
    },
    responsaveis: [], // Lista de responsáveis disponíveis
  }),

  actions: {
    async fetchTodos() {
      try {
        const response = await http.get("/tarefas");
        this.todos = response.data;
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        throw error;
      }
    },

    async addTodo(
      task,
      responsavelId = null,
      dataInicio = null,
      dataTermino = null,
      status = "pendente"
    ) {
      try {
        const tarefaData = {
          descricao: task,
          status: status,
          responsavel: responsavelId,
          dataInicio: dataInicio,
          dataTermino: dataTermino,
        };

        const response = await http.post("/tarefas", tarefaData);
        this.todos.push(response.data);
        return response.data;
      } catch (error) {
        console.error("Erro ao adicionar tarefa:", error);
        throw error;
      }
    },

    async updateTodo(
      index,
      task,
      responsavelId = null,
      dataInicio = null,
      dataTermino = null,
      status = null
    ) {
      try {
        const todo = this.todos[index];
        const updateData = {
          descricao: task,
          responsavel: responsavelId,
          dataInicio: dataInicio,
          dataTermino: dataTermino,
        };

        if (status !== null) {
          updateData.status = status;
        }

        await http.put(`/tarefas/${todo._id}`, updateData);

        // Atualiza localmente
        this.todos[index].descricao = task;
        this.todos[index].responsavel = responsavelId;
        this.todos[index].dataInicio = dataInicio;
        this.todos[index].dataTermino = dataTermino;
        if (status !== null) {
          this.todos[index].status = status;
        }
      } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        throw error;
      }
    },

    async updateTodoStatus(index, status) {
      try {
        const todo = this.todos[index];
        await http.put(`/tarefas/${todo._id}`, {
          status: status,
          descricao: todo.descricao,
          responsavel: todo.responsavel,
          dataInicio: todo.dataInicio,
          dataTermino: todo.dataTermino,
        });
        this.todos[index].status = status;
      } catch (error) {
        console.error("Erro ao atualizar status da tarefa:", error);
        throw error;
      }
    },

    async updateTodoResponsavel(index, responsavelId) {
      try {
        const todo = this.todos[index];
        await http.put(`/tarefas/${todo._id}`, {
          responsavel: responsavelId,
          descricao: todo.descricao,
          status: todo.status,
          dataInicio: todo.dataInicio,
          dataTermino: todo.dataTermino,
        });
        this.todos[index].responsavel = responsavelId;
      } catch (error) {
        console.error("Erro ao atualizar responsável da tarefa:", error);
        throw error;
      }
    },

    async updateTodoPrazos(index, dataInicio, dataTermino) {
      try {
        const todo = this.todos[index];
        await http.put(`/tarefas/${todo._id}`, {
          dataInicio: dataInicio,
          dataTermino: dataTermino,
          descricao: todo.descricao,
          status: todo.status,
          responsavel: todo.responsavel,
        });
        this.todos[index].dataInicio = dataInicio;
        this.todos[index].dataTermino = dataTermino;
      } catch (error) {
        console.error("Erro ao atualizar prazos da tarefa:", error);
        throw error;
      }
    },

    async deleteTodo(index) {
      try {
        const todo = this.todos[index];
        await http.delete(`/tarefas/${todo._id}`);
        this.todos.splice(index, 1);
      } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
        throw error;
      }
    },

    setFilter(filterType, value) {
      this.filters[filterType] = value;
    },

    clearFilters() {
      this.filters = {
        categoria: null,
        status: "all",
        search: "",
        responsavel: null,
      };
    },

    setEditIndex(index) {
      this.editIndex = index;
    },

    clearEditIndex() {
      this.editIndex = null;
    },

    // Métodos para gerenciar responsáveis
    async fetchResponsaveis() {
      try {
        const response = await http.get("/responsaveis");
        this.responsaveis = response.data;
      } catch (error) {
        console.error("Erro ao buscar responsáveis:", error);
      }
    },

    async createResponsavel(nome, email) {
      try {
        const response = await http.post("/responsaveis", { nome, email });
        this.responsaveis.push(response.data);
        return response.data;
      } catch (error) {
        console.error("Erro ao criar responsável:", error);
        throw error;
      }
    },
  },

  getters: {
    filteredTodos: (state) => {
      return state.todos.filter((todo) => {
        // Filtro por status
        if (
          state.filters.status !== "all" &&
          todo.status !== state.filters.status
        ) {
          return false;
        }

        // Filtro por responsável
        if (
          state.filters.responsavel &&
          todo.responsavel !== state.filters.responsavel
        ) {
          return false;
        }

        // Filtro por busca
        if (
          state.filters.search &&
          !todo.descricao
            .toLowerCase()
            .includes(state.filters.search.toLowerCase())
        ) {
          return false;
        }

        return true;
      });
    },

    // Getters para estatísticas
    stats: (state) => {
      const total = state.todos.length;
      const concluidas = state.todos.filter(
        (todo) => todo.status === "concluida"
      ).length;
      const pendentes = state.todos.filter(
        (todo) => todo.status === "pendente"
      ).length;
      const emAndamento = state.todos.filter(
        (todo) => todo.status === "andamento"
      ).length;
      const atrasadas = state.todos.filter((todo) => {
        if (todo.status !== "concluida" && todo.dataTermino) {
          return new Date(todo.dataTermino) < new Date();
        }
        return false;
      }).length;

      const completionRate = total > 0 ? (concluidas / total) * 100 : 0;

      return {
        total,
        concluidas,
        pendentes,
        emAndamento,
        atrasadas,
        completionRate: Math.round(completionRate),
      };
    },

    // Getter para responsável por ID
    getResponsavelById: (state) => (id) => {
      return state.responsaveis.find((resp) => resp._id === id);
    },

    // Getter para tarefas por responsável
    todosPorResponsavel: (state) => (responsavelId) => {
      return state.todos.filter((todo) => todo.responsavel === responsavelId);
    },

    // Getter para tarefas atrasadas
    tarefasAtrasadas: (state) => {
      return state.todos.filter((todo) => {
        return (
          todo.status !== "concluida" &&
          todo.dataTermino &&
          new Date(todo.dataTermino) < new Date()
        );
      });
    },

    // Getter para próximas tarefas (vencimento em 3 dias)
    tarefasProximas: (state) => {
      const tresDias = new Date();
      tresDias.setDate(tresDias.getDate() + 3);

      return state.todos.filter((todo) => {
        return (
          todo.status !== "concluida" &&
          todo.dataTermino &&
          new Date(todo.dataTermino) <= tresDias &&
          new Date(todo.dataTermino) >= new Date()
        );
      });
    },
  },
});

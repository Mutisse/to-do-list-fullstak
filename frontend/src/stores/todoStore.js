import { defineStore } from "pinia";
import http from "../http";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [],
    editIndex: null,
  }),
  actions: {
    async fetchTodos() {
      try {
        const response = await http.get("/tarefas");
        this.todos = response.data;
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
      }
    },

    async addTodo(task) {
      try {
        const response = await http.post("/tarefas", { descricao: task });
        this.todos.push(response.data);
      } catch (error) {
        console.error("Erro ao adicionar tarefa:", error);
      }
    },

    async updateTodo(index, task) {
      try {
        const todo = this.todos[index];
        await http.put(`/tarefas/${todo._id}`, { descricao: task, estado: todo.estado });
        this.todos[index].descricao = task;
      } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
      }
    },

    async toggleTodoStatus(index) {
      try {
        const todo = this.todos[index];
        await http.put(`/tarefas/${todo._id}`, { estado: !todo.estado });
        this.todos[index].estado = !this.todos[index].estado;
      } catch (error) {
        console.error("Erro ao atualizar status da tarefa:", error);
      }
    },

    async deleteTodo(index) {
      try {
        const todo = this.todos[index];
        await http.delete(`/tarefas/${todo._id}`);
        this.todos.splice(index, 1);
      } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
      }
    },
  },
});

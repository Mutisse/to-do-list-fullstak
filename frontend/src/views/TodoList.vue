<template>
  <div class="container">
    <input
      v-model="input"
      class="input-task"
      placeholder="Atividade a fazer..."
    />
    <button class="button-add-task" @click="adicionarOuAtualizarTarefa">
      {{ tarefaParaEditar !== null ? "Atualizar" : "Adicionar" }}
    </button>

    <ul class="list-tasks">
      <li
        v-for="(item, index) in todos"
        :key="item._id"
        class="task"
        :class="{ done: item.estado }"
        @dblclick="editarTarefa(index)"
      >
        <img
          src="../assets/img/checked.png"
          alt="check-na-tarefa"
          @click="concluirTarefa(index)"
        />
        <p>{{ item.descricao }}</p>
        <p class="date">{{ item.dataCriacao}}
        </p>
        <img
          src="../assets/img/trash.png"
          alt="tarefa-para-o-lixo"
          @click="deletarItem(index)"
        />
      </li>
    </ul>
  </div>
</template>
<script>
import { useTodoStore } from "../stores/todoStore";

export default {
  data() {
    return {
      input: "",
      tarefaParaEditar: null,
    };
  },
  computed: {
    todos() {
      const store = useTodoStore();
      return store.todos;
    },
  },
  methods: {
    async adicionarTarefa() {
      if (this.input.trim() === "") {
        alert("O campo precisa ser preenchido!");
        return;
      }

      const store = useTodoStore();
      await store.addTodo(this.input);
      this.input = ""; // Limpar o campo de entrada após adicionar
    },
    async atualizarTarefa() {
      if (this.input.trim() === "") {
        alert("O campo precisa ser preenchido!");
        return;
      }

      const store = useTodoStore();
      // Atualizar a tarefa existente usando o índice da tarefa
      await store.updateTodo(this.tarefaParaEditar, this.input);
      this.tarefaParaEditar = null; // Limpar o índice após atualizar
      this.input = ""; // Limpar o campo de entrada após atualizar
    },
    async concluirTarefa(index) {
      const store = useTodoStore();
      await store.toggleTodoStatus(index);
    },
    async deletarItem(index) {
      const store = useTodoStore();
      await store.deleteTodo(index);
    },
    editarTarefa(index) {
      if (this.todos[index].estado) {
        alert("Não é possível editar uma tarefa concluída!");
        return;
      }
      this.input = this.todos[index].descricao;
      this.tarefaParaEditar = index;
    },
    handleKeyPress(event) {
      if (event.key === "Enter") {
        if (this.tarefaParaEditar !== null) {
          this.atualizarTarefa();
        } else {
          this.adicionarTarefa();
        }
      }
    },
    adicionarOuAtualizarTarefa() {
      if (this.tarefaParaEditar !== null) {
        this.atualizarTarefa();
      } else {
        this.adicionarTarefa();
      }
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyPress);
    const store = useTodoStore();
    store.fetchTodos();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress);
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.container {
  background-color: #ecf0f1;
  width: 90%;
  max-width: 600px;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.input-task {
  border: 2px solid #2c3e50;
  border-radius: 8px;
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  font-size: 1rem;
  color: #333;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.input-task:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.button-add-task {
  border: none;
  border-radius: 8px;
  height: 48px;
  background-color: #2c3e50;
  color: #fff;
  font-size: 1rem;
  padding: 0 2rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.button-add-task:hover {
  background-color: #34495e;
  transform: translateY(-2px);
}

.button-add-task:active {
  transform: translateY(0);
}

.button-add-task:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

.list-tasks {
  width: 100%;
  list-style: none;
  margin-top: 2rem;
}

.task {
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.task:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.task p {
  flex: 1;
  margin: 0 1rem;
  word-break: break-word;
  font-size: 1rem;
  color: #333;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task img {
  width: 24px;
  height: 24px;
  opacity: 0.7;
  transition: all 0.3s ease;
  cursor: pointer;
}

.task img:hover {
  opacity: 1;
  transform: scale(1.1);
}

.done {
  background-color: rgba(39, 174, 96, 0.1);
  border-left: 4px solid #27ae60;
}

.done p {
  text-decoration: line-through;
  color: #27ae60;
}

.date {
  font-size: 0.75rem;
  color: #7f8c8d;
  width: 100%;
  text-align: right;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Media Queries para responsividade */
@media (min-width: 480px) {
  .input-container {
    display: flex;
    gap: 1rem;
  }
  
  .input-task {
    margin-bottom: 0;
  }
  
  .button-add-task {
    width: auto;
  }
  
  .task {
    flex-wrap: nowrap;
    padding: 1rem 1.5rem;
  }
  
  .date {
    width: auto;
    margin-top: 0;
    margin-left: 1rem;
  }
}

@media (min-width: 768px) {
  .container {
    margin: 3rem auto;
    padding: 2.5rem;
  }
  
  .task {
    padding: 1rem 2rem;
  }
}

/* Animações */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.task {
  animation: fadeIn 0.3s ease forwards;
}

/* Acessibilidade */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
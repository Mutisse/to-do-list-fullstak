import { createRouter, createWebHistory } from 'vue-router';
import TodoList from '../views/TodoList.vue'; // Certifique-se de que o caminho está correto

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TodoList
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

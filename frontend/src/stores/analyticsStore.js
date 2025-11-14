import { defineStore } from "pinia";
import http from "../http";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [],
    selectedCategory: null,
  }),

  actions: {
    async fetchCategories() {
      try {
        const response = await http.get("/categorias");
        this.categories = response.data;
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    },

    async createCategory(name, cor = "#3498db") {
      try {
        const response = await http.post("/categorias", { nome: name, cor });
        this.categories.push(response.data);
        return response.data;
      } catch (error) {
        console.error("Erro ao criar categoria:", error);
        throw error;
      }
    },

    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
    },

    clearSelection() {
      this.selectedCategory = null;
    },
  },

  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find((cat) => cat._id === id);
    },
  },
});

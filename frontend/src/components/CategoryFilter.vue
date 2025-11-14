<template>
  <div class="category-filter">
    <h3>Categorias</h3>
    <div class="categories-list">
      <button 
        v-for="category in categories" 
        :key="category._id"
        :class="['category-btn', { active: selectedCategory === category._id }]"
        :style="{ backgroundColor: category.cor }"
        @click="toggleCategory(category._id)"
      >
        {{ category.nome }}
      </button>
    </div>
  </div>
</template>

<script>
import { useCategoryStore } from '../stores/categoryStore';
import { useTodoStore } from '../stores/todoStore';

export default {
  setup() {
    const categoryStore = useCategoryStore();
    const todoStore = useTodoStore();
    
    return {
      categories: categoryStore.categories,
      selectedCategory: categoryStore.selectedCategory,
      toggleCategory: (categoryId) => {
        if (categoryStore.selectedCategory === categoryId) {
          categoryStore.clearSelection();
          todoStore.setFilter('categoria', null);
        } else {
          categoryStore.selectCategory(categoryId);
          todoStore.setFilter('categoria', categoryId);
        }
      }
    };
  },
  
  async mounted() {
    const categoryStore = useCategoryStore();
    await categoryStore.fetchCategories();
  }
}
</script>
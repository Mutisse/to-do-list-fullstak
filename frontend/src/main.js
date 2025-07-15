import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia"; // Importar Pinia
import router from "./router"; // Se estiver usando o Vue Router

const app = createApp(App);

app.use(createPinia()); // Usar Pinia
app.use(router); // Usar Vue Router, se aplicável
app.mount("#app");

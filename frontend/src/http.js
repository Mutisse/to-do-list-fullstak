import axios from "axios";

// Crie uma instância do axios com uma configuração base
const instance = axios.create({
  baseURL: "https://to-do-list-fullstak.onrender.com/api", // ✅ ADICIONE /api
  timeout: 10000, // ✅ AUMENTE para 10 segundos
  headers: { "Content-Type": "application/json" },
});

export default instance;
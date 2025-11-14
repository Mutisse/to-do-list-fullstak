import axios from "axios";

// Crie uma instância do axios com uma configuração base
const instance = axios.create({
  baseURL: "https://to-do-list-fullstak.onrender.com", // URL base para suas requisições
  timeout: 1000, // Tempo de espera para resposta
  headers: { "Content-Type": "application/json" },
});

export default instance;

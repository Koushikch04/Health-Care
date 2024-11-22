// const baseURL = "http://localhost:8000";

console.log(import.meta.env);

const baseURL = import.meta.env.VITE_BACKEND || "http://localhost:8000";
export { baseURL };

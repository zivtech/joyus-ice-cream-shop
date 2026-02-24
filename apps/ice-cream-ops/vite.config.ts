import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, "index.html"),
        staffing_planner: resolve(__dirname, "staffing-planner.html"),
        seasonal_playbook: resolve(__dirname, "seasonal-playbook.html"),
        react_shell: resolve(__dirname, "react-shell.html")
      }
    }
  }
});

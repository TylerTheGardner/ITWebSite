import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to '/' for a custom domain or username.github.io root repo.
  // Change to '/ITWebSite/' if hosting as a project page (github.com/TylerTheGardner/ITWebSite).
  // Use '/ITWebSite/' for GitHub project pages; switch to '/' once you have a custom domain.
  base: '/ITWebSite/',
})

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const BUILD_ID = String(Date.now());
// version.json lets the site notice a new deploy and refresh itself (see src/main.jsx)
const versionFile = () => ({ name: "version-file", generateBundle() { this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ id: BUILD_ID }) }); } });
export default defineConfig({
  plugins: [react(), versionFile()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  build: { assetsDir: "static" }, // hashed JS/CSS go to /static (cached forever); /assets stays for your images
});

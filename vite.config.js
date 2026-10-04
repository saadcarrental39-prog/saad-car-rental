import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
const BUILD_ID = String(Date.now());
// version.json lets the site notice a new deploy and refresh itself (see src/main.jsx)
const versionFile = () => ({ name: "version-file", generateBundle() { this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ id: BUILD_ID }) }); } });
// admin-sw.js is rebuilt with a new version number on every deploy -> installed phone app updates itself
const swFile = () => ({ name: "admin-sw", generateBundle() { this.emitFile({ type: "asset", fileName: "admin-sw.js", source: readFileSync("sw/admin-sw.template.js", "utf8").replace("__BUILD_ID__", BUILD_ID) }); } });
export default defineConfig({
  plugins: [react(), versionFile(), swFile()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  build: { assetsDir: "bundle" }, // hashed JS/CSS go to /bundle (cached forever); /assets stays for your images
});

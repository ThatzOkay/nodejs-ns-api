import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: path.resolve(__dirname, "src/nsapi.ts"),
      name: "NSAPI",
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `nsapi.${format}.js`,
    },
  }
})

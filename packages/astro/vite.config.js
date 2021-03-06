/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-26 18:12:06
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-27 16:14:06
 * @Description: 
 */
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'YhBaguaAstro',
      fileName: 'yhbagua-astro'
    },
    minify: false,
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // 不需要打包进来的内容
      external: [],
      output: {
        // 所有external排除打包的模块，要在globals中声明变量名称
        globals: {}
      }
    }
  }
})
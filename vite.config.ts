import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import vueDevTools from 'vite-plugin-vue-devtools'
import viteCompression from 'vite-plugin-compression'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import { viteMockServe } from 'vite-plugin-mock'
import { VitePWA } from 'vite-plugin-pwa'
// import { visualizer } from 'rollup-plugin-visualizer'

export default ({ mode }: { mode: string }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL, VITE_API_URL, VITE_API_PROXY_URL, VITE_API_MODE } = env

  // 仅在 mock 或 hybrid 模式下启用 vite-plugin-mock 拦截
  const enableMock = VITE_API_MODE === 'mock' || VITE_API_MODE === 'hybrid'

  console.log(`🚀 API_URL = ${VITE_API_URL}`)
  console.log(`🚀 VERSION = ${VITE_VERSION}`)
  console.log(`🚀 API_MODE = ${VITE_API_MODE || 'http'} (Mock 拦截: ${enableMock ? '启用' : '禁用'})`)

  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    base: VITE_BASE_URL,
    server: {
      https: false,
      port: Number(VITE_PORT),
      proxy: {
        '/api': {
          target: VITE_API_PROXY_URL,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      },
      host: true
    },
    // 路径别名
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@views': resolvePath('src/views'),
        '@imgs': resolvePath('src/assets/images'),
        '@icons': resolvePath('src/assets/icons'),
        '@utils': resolvePath('src/utils'),
        '@stores': resolvePath('src/store'),
        '@styles': resolvePath('src/assets/styles')
      }
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      dynamicImportVarsOptions: {
        warnOnError: true,
        exclude: [],
        include: ['src/views/**/*.vue']
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('echarts') || id.includes('zrender')) return 'vendor-echarts'
              if (id.includes('element-plus')) return 'vendor-element-plus'
              if (id.includes('highlight.js')) return 'vendor-highlight'
              if (id.includes('@vueuse')) return 'vendor-vueuse'
              if (id.includes('xlsx')) return 'vendor-xlsx'
              if (id.includes('xgplayer')) return 'vendor-xgplayer'
              if (id.includes('/vue/') || id.includes('@vue/') || id.includes('vue-router') || id.includes('pinia')) return 'vendor-vue'
              if (id.includes('axios')) return 'vendor-axios'
              if (id.includes('crypto-js')) return 'vendor-crypto'
              if (id.includes('wangeditor') || id.includes('@wangeditor')) return 'vendor-wangeditor'
              if (id.includes('file-saver') || id.includes('vue-draggable') || id.includes('qrcode')) return 'vendor-utils'
              return 'vendor-other'
            }
          }
        }
      }
    },
    plugins: [
      vue(),
      tailwindcss(),
      // 自动按需导入 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/types/import/auto-imports.d.ts',
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        eslintrc: {
          enabled: true,
          filepath: './.auto-import.json',
          globalsPropValue: true
        }
      }),
      Components({
        dts: 'src/types/import/components.d.ts',
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })]
      }),
      ElementPlus({
        useSource: false
      }),
      // 压缩
      viteCompression({
        verbose: false,
        disable: false,
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240,
        deleteOriginFile: false
      }),
      viteCompression({
        verbose: false,
        disable: false,
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
        deleteOriginFile: false
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico'],
        manifest: {
          name: 'Dreamcraft Astra',
          short_name: 'Astra',
          description: 'AI短剧制作平台',
          theme_color: '#ffffff',
          background_color: '#fafbfc',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['assets/**/*.{js,css,svg,webp,png,ico}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/server\.bsuniversal\.cn\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5
                },
                networkTimeoutSeconds: 10
              }
            }
          ]
        },
        devOptions: {
          enabled: false
        }
      }),
      vueDevTools(),
      // Mock 服务（仅开发环境 + API_MODE 为 mock/hybrid 时启用）
      // 注意：vite-plugin-mock v3 使用 `enable` 字段替代 v2 的 `localEnabled/prodEnabled`
      viteMockServe({
        mockPath: 'src/mock',
        enable: mode === 'development' && enableMock,
        injectCode: `
          if (typeof window !== 'undefined') {
            console.log('[Mock] API Mock 服务已启用');
          }
        `
      })
      // 打包分析
      // visualizer({
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'dist/stats.html' // 分析图生成的文件名及路径
      // }),
    ],
    // 依赖预构建：避免运行时重复请求与转换，提升首次加载速度
    optimizeDeps: {
      include: [
        'echarts/core',
        'xlsx',
        'xgplayer',
        'file-saver',
        'vue-img-cutter',
        'element-plus/es',
        'element-plus/es/components/*/style/css',
        'element-plus/es/components/*/style/index',
        '@wangeditor/editor',
        'pinia-plugin-persistedstate',
        'mitt',
        'axios',
        'nprogress',
        'qrcode.vue'
      ]
    },
    css: {
      preprocessorOptions: {
        // sass variable and mixin
        scss: {
          additionalData: `
            @use "@styles/core/mixin.scss" as *;
          `
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  })
}

function resolvePath(paths: string) {
  return path.resolve(__dirname, paths)
}

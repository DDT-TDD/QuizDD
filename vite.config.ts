import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // Vite options tailored for Tauri development
  clearScreen: false,
  
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  
  // CSS Modules configuration
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: mode === 'production' 
        ? '[hash:base64:8]' 
        : '[name]__[local]___[hash:base64:5]'
    },
    // CSS optimization - disabled for now to avoid build issues
    // postcss: {
    //   plugins: mode === 'production' ? [
    //     autoprefixer(),
    //     cssnano({
    //       preset: 'default',
    //     }),
    //   ] : [],
    // },
  },
  
  // Build configuration - OPTIMIZED
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // Enhanced minification for production
    minify: mode === 'production' ? 'esbuild' : !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produce sourcemaps for debug builds only
    sourcemap: !!process.env.TAURI_DEBUG,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          vendor: ['react', 'react-dom'],
          // Tauri API chunk
          tauri: ['@tauri-apps/api'],
          // Lottie animations chunk
          animations: ['lottie-react'],
        },
        // Optimize chunk file names
        chunkFileNames: mode === 'production' 
          ? 'assets/[name].[hash].js'
          : 'assets/[name].js',
        entryFileNames: mode === 'production'
          ? 'assets/[name].[hash].js'
          : 'assets/[name].js',
        assetFileNames: mode === 'production'
          ? 'assets/[name].[hash].[ext]'
          : 'assets/[name].[ext]',
      },
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // 4KB - inline smaller assets
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  
  // Optimization configuration
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tauri-apps/api',
      'lottie-react',
    ],
    // Force pre-bundling of these dependencies
    force: mode === 'production',
  },
  
  // Define global constants for optimization
  define: {
    __DEV__: JSON.stringify(mode === 'development'),
    __PROD__: JSON.stringify(mode === 'production'),
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@types': '/src/types',
      '@styles': '/src/styles',
    },
  },
  
  // Performance optimizations
  esbuild: {
    // Remove debugger statements in production
    drop: mode === 'production' ? ['debugger'] : [],
    // Remove console statements in production (alternative method)
    pure: mode === 'production' ? ['console.log', 'console.warn'] : [],
  },
}))
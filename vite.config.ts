import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import path from 'path'

/**
 * The MDX plugin compiles every module whose path ends in .mdx, including `post.mdx?raw`, which
 * Vite has already turned into a module exporting the file's text. src/lib/blog.ts reads each
 * post's frontmatter from that text, so `?raw` imports must reach it uncompiled.
 */
function mdxExceptRaw(options: Parameters<typeof mdx>[0]): Plugin {
  const plugin = mdx(options) as Plugin
  const compile = plugin.transform
  if (typeof compile !== 'function')
    throw new Error('Expected the MDX plugin to have a transform function')
  return {
    ...plugin,
    transform(code, id, ...rest) {
      if (/[?&]raw(?:&|$)/.test(id)) return null
      return compile.call(this, code, id, ...rest)
    },
  }
}

export default defineConfig({
  plugins: [
    mdxExceptRaw({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // The development server loads Agentation through a lazy import, which it would otherwise find
  // only after the page loads, and then bundle against a second copy of React.
  optimizeDeps: {
    include: ['agentation'],
  },
})

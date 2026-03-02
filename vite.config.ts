import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin to inline CSS into index.html during build
function inlineCssPlugin(): Plugin {
  return {
    name: 'inline-css',
    enforce: 'post',
    transformIndexHtml(html, context) {
      const bundle = context.bundle;
      if (!bundle) return html;

      const cssAssets = Object.values(bundle).filter(
        (file) => file.type === 'asset' && file.fileName.endsWith('.css')
      );

      let newHtml = html;
      for (const asset of cssAssets) {
        if (asset.type === 'asset' && typeof asset.source === 'string') {
          // Remove the <link> tag for this css
          const linkRegex = new RegExp(`<link[^>]*href="[^"]*${asset.fileName}"[^>]*>`, 'g');
          newHtml = newHtml.replace(linkRegex, '');

          // Inject it as a <style> tag in head
          newHtml = newHtml.replace('</head>', `\n<style>\n${asset.source}\n</style>\n</head>`);

          // Delete the asset from bundle so it's not emitted as a file
          delete bundle[asset.fileName];
        }
      }
      return newHtml;
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    inlineCssPlugin(),
  ],
})

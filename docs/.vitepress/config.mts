import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/codetop-notes/',
  lang: 'zh-CN',
  title: '刷题笔记',
  description: 'CodeTop 刷题笔记，GitHub Gist 持久化',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.min.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/markdown/markdown.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/clike/clike.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/python/python.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/javascript/javascript.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/go/go.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/sql/sql.js' }]
  ],
  themeConfig: {
    siteUrl: 'https://yzq-zz.github.io/codetop-notes/',
    nav: [
      { text: '首页', link: '/' },
      { text: '题目列表', link: '/problems/' }
    ]
  }
})

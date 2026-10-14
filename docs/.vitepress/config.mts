import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/codetop-notes/',
  lang: 'zh-CN',
  title: '刷题笔记',
  description: 'CodeTop 刷题笔记，GitHub Gist 持久化',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
  ],
  markdown: {
    lineNumbers: false
  },
  ssr: false,
  themeConfig: {
    siteUrl: 'https://yzq-zz.github.io/codetop-notes/',
    nav: [
      { text: '首页', link: '/' },
      { text: '题目列表', link: '/problems/' }
    ]
  }
})

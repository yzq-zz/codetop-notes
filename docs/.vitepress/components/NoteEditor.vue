<script setup>
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, highlightActiveLine } from '@codemirror/view'
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching } from '@codemirror/language'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { closeBrackets } from '@codemirror/autocomplete'
import { java } from '@codemirror/lang-java'
import markdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps({
  problem: {
    type: Object,
    default: null
  }
})

const content = ref('')
const status = ref('')
const statusType = ref('')
const saving = ref(false)
const token = ref('')
const loaded = ref(false)
const editorContainer = ref(null)
const previewContainer = ref(null)
const editorView = ref(null)
const showContextMenu = ref(false)
const contextMenuStyle = ref({ top: '0px', left: '0px' })

// GitHub 配置
const GH_REPO = 'yzq-zz/notes-data'
const NOTES_BRANCH = 'main'
const TOKEN_KEY = 'codetop_token'

// 初始化 markdown-it
const md = markdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

// 预览 HTML
const previewHtml = computed(() => {
  return md.render(content.value || '')
})

onMounted(async () => {
  // 加载 Token
  token.value = localStorage.getItem(TOKEN_KEY) || ''
  loaded.value = true
  loadNote()
  
  // 点击其他地方关闭右键菜单
  document.addEventListener('click', closeContextMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeContextMenu)
})

// 初始化 CodeMirror 编辑器
function initEditor(initialContent) {
  if (editorView.value) {
    editorView.value.destroy()
  }

  const extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    highlightActiveLine(),
    keymap.of([
      defaultKeymap,
      historyKeymap,
      indentWithTab
    ]),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        content.value = update.state.doc.toString()
      }
    }),
    EditorView.domEventHandlers({
      contextmenu: (event) => {
        event.preventDefault()
        showContextMenuAt(event.clientX, event.clientY)
      }
    })
  ]

  const state = EditorState.create({
    doc: initialContent,
    extensions
  })

  editorView.value = new EditorView({
    state,
    parent: editorContainer.value
  })
}

// 显示右键菜单
function showContextMenuAt(x, y) {
  contextMenuStyle.value = {
    top: y + 'px',
    left: x + 'px'
  }
  showContextMenu.value = true
}

// 关闭右键菜单
function closeContextMenu() {
  showContextMenu.value = false
}

// 添加代码块
function addCodeBlock() {
  closeContextMenu()
  
  if (!editorView.value) return
  
  const state = editorView.value.state
  const pos = state.selection.main.head
  
  const codeBlock = '\n```java\n// 在这里写代码\n```\n'
  const transaction = state.update({
    changes: {
      from: pos,
      to: pos,
      insert: codeBlock
    },
    selection: { anchor: pos + 8 } // 定位到 "// 在这里写代码" 后面
  })
  
  editorView.value.dispatch(transaction)
  content.value = editorView.value.state.doc.toString()
  editorView.value.focus()
}

async function loadNote() {
  if (!props.problem) return

  if (!token.value) {
    content.value = '# 欢迎使用刷题笔记\n\n请先输入 GitHub Token 开始使用。'
    return
  }

  const filePath = `notes/${props.problem.id}.md`
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${filePath}?ref=${NOTES_BRANCH}`,
      {
        headers: { 'Authorization': `token ${token.value}` }
      }
    )

    if (response.ok) {
      const data = await response.json()
      content.value = atob(data.content.replace(/\n/g, ''))
      showStatus('笔记加载成功')
      nextTick(() => initEditor(content.value))
    } else if (response.status === 404) {
      content.value = `# ${props.problem.title} 笔记\n\n## 思路\n\n\n\n## 代码\n\n\`\`\`java\n\n\`\`\`\n\n## 总结\n\n`
      showStatus('新建笔记')
      nextTick(() => initEditor(content.value))
    } else {
      showStatus('加载失败', 'error')
    }
  } catch (e) {
    showStatus('加载失败', 'error')
    console.error(e)
  }
}

async function saveNote() {
  if (!token.value || !props.problem) return

  saving.value = true
  showStatus('保存中...')

  const filePath = `notes/${props.problem.id}.md`
  const fileContent = btoa(unescape(encodeURIComponent(content.value)))

  try {
    let sha = null
    const getResponse = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${filePath}?ref=${NOTES_BRANCH}`,
      { headers: { 'Authorization': `token ${token.value}` } }
    )

    if (getResponse.ok) {
      const data = await getResponse.json()
      sha = data.sha
    }

    localStorage.setItem(TOKEN_KEY, token.value)

    const payload = {
      message: `更新笔记: ${props.problem.title}`,
      content: fileContent,
      branch: NOTES_BRANCH
    }
    if (sha) payload.sha = sha

    const response = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    if (response.ok) {
      showStatus('笔记已保存到云端')
    } else {
      const err = await response.json()
      showStatus(err.message || '保存失败', 'error')
    }
  } catch (e) {
    showStatus('保存失败', 'error')
    console.error(e)
  } finally {
    saving.value = false
  }
}

function showStatus(msg, type = '') {
  status.value = msg
  statusType.value = type
  setTimeout(() => { if (status.value === msg) status.value = '' }, 4000)
}
</script>

<template>
  <div>
    <h1 v-if="problem">#{{ problem.id }} {{ problem.title }}</h1>
    <p v-if="problem"><a :href="problem.link" target="_blank">力扣链接</a></p>
    <p v-else-if="!loaded">加载中...</p>

    <div class="toolbar">
      <label>GitHub Token:
        <input type="password" v-model="token" placeholder="输入 Token..." style="width: 200px;" />
      </label>
      <button @click="saveNote" :disabled="saving || !loaded" class="save-btn">{{ saving ? '保存中...' : '保存笔记' }}</button>
    </div>
    
    <p style="font-size: 12px; color: #666;">
      提示：Token 需要有 repo 权限，右键可添加代码块
      <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank">创建 Token</a>
    </p>
    
    <p v-if="status" :style="{ color: statusType === 'error' ? 'red' : 'green' }">{{ status }}</p>
    
    <div class="editor-area">
      <div class="editor-pane">
        <div class="pane-header">编辑</div>
        <div class="editor-wrapper" ref="editorContainer"></div>
      </div>
      <div class="preview-pane">
        <div class="pane-header">预览</div>
        <div class="preview-wrapper" ref="previewContainer" v-html="previewHtml"></div>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div 
      v-if="showContextMenu" 
      class="context-menu"
      :style="contextMenuStyle"
    >
      <div class="menu-item" @click="addCodeBlock">
        添加代码块
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 15px 0;
  flex-wrap: wrap;
}

.save-btn {
  padding: 6px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background: #2563eb;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.editor-area {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  height: 600px;
}

.editor-pane, .preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.pane-header {
  background: #f3f4f6;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 1px solid #d1d5db;
}

.editor-wrapper {
  flex: 1;
  overflow: auto;
}

.editor-wrapper :deep(.cm-editor) {
  height: 100%;
}

.editor-wrapper :deep(.cm-scroller) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.preview-wrapper {
  flex: 1;
  padding: 16px 20px;
  overflow: auto;
  background: #fff;
}

/* Markdown 预览样式 */
.preview-wrapper :deep(h1) {
  font-size: 1.8em;
  margin-bottom: 0.8em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.preview-wrapper :deep(h2) {
  font-size: 1.4em;
  margin-top: 1.5em;
  margin-bottom: 0.6em;
}

.preview-wrapper :deep(p) {
  margin: 1em 0;
  line-height: 1.8;
}

.preview-wrapper :deep(pre.hljs) {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
  font-size: 13px;
  line-height: 1.5;
}

.preview-wrapper :deep(pre.hljs code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.preview-wrapper :deep(code) {
  background: #f1f1f1;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  color: #e06c75;
}

.preview-wrapper :deep(pre.hljs code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.preview-wrapper :deep(ul), .preview-wrapper :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.preview-wrapper :deep(li) {
  margin: 0.5em 0;
}

.preview-wrapper :deep(a) {
  color: #3b82f6;
  text-decoration: none;
}

.preview-wrapper :deep(a:hover) {
  text-decoration: underline;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  padding: 4px 0;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f3f4f6;
}

@media (max-width: 768px) {
  .editor-area {
    flex-direction: column;
    height: auto;
  }
  
  .editor-pane, .preview-pane {
    height: 400px;
  }
}
</style>

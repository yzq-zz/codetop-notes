<script setup>
import { ref, onMounted, watch, shallowRef } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view'
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'

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
const editorView = shallowRef(null)
const isDark = ref(false)

// GitHub 配置
const GH_REPO = 'yzq-zz/notes-data'
const NOTES_BRANCH = 'main'
const TOKEN_KEY = 'codetop_token'

onMounted(async () => {
  // 加载 Token
  token.value = localStorage.getItem(TOKEN_KEY) || ''
  loaded.value = true
  loadNote()
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
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab
    ]),
    java(),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        content.value = update.state.doc.toString()
      }
    })
  ]

  // 根据主题选择
  if (isDark.value) {
    extensions.push(oneDark)
  }

  const state = EditorState.create({
    doc: initialContent,
    extensions
  })

  editorView.value = new EditorView({
    state,
    parent: editorContainer.value
  })
}

// 切换主题
function toggleTheme() {
  isDark.value = !isDark.value
  // 重新初始化编辑器以应用主题
  if (editorView.value) {
    initEditor(content.value)
  }
}

// 提取代码块内容（用于代码高亮预览）
function extractCodeBlocks(markdown) {
  const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g
  const codeBlocks = []
  let match
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    codeBlocks.push(match[1])
  }
  return codeBlocks
}

// 预览模式：渲染代码高亮
function getHighlightedPreview(markdown) {
  // 简单处理：返回带 ``` 的代码块用于预览
  return markdown
    .replace(/```java\n([\s\S]*?)```/g, '<pre class="code-preview"><code>$1</code></pre>')
    .replace(/```\n([\s\S]*?)```/g, '<pre class="code-preview"><code>$1</code></pre>')
    .replace(/\n/g, '<br>')
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
      initEditor(content.value)
    } else if (response.status === 404) {
      content.value = `# ${props.problem.title} 笔记\n\n## 思路\n\n\n\n## 代码\n\n\`\`\`java\n\n\`\`\`\n\n## 总结\n\n`
      showStatus('新建笔记')
      initEditor(content.value)
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
    // 先获取当前文件 SHA（如果存在）
    let sha = null
    const getResponse = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${filePath}?ref=${NOTES_BRANCH}`,
      { headers: { 'Authorization': `token ${token.value}` } }
    )

    if (getResponse.ok) {
      const data = await getResponse.json()
      sha = data.sha
    }

    // 保存 Token 到 localStorage
    localStorage.setItem(TOKEN_KEY, token.value)

    // 更新或创建文件
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
        <input type="password" v-model="token" placeholder="输入 Token..." style="width: 250px;" />
      </label>
      <button @click="toggleTheme" class="theme-btn">{{ isDark ? '浅色' : '深色' }}主题</button>
      <button @click="saveNote" :disabled="saving || !loaded" class="save-btn">{{ saving ? '保存中...' : '保存笔记' }}</button>
    </div>
    
    <p style="font-size: 12px; color: #666;">
      提示：Token 需要有 repo 权限，笔记将保存到 yzq-zz/notes-data 仓库
      <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank">创建 Token</a>
    </p>
    
    <p v-if="status" :style="{ color: statusType === 'error' ? 'red' : 'green' }">{{ status }}</p>
    
    <div class="editor-wrapper" ref="editorContainer"></div>
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

.theme-btn {
  padding: 6px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.theme-btn:hover {
  background: #4b5563;
}

.editor-wrapper {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  min-height: 400px;
}

.editor-wrapper :deep(.cm-editor) {
  height: 100%;
  min-height: 400px;
}

.editor-wrapper :deep(.cm-scroller) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.editor-wrapper :deep(.cm-content) {
  padding: 10px 0;
}

.editor-wrapper :deep(.cm-line) {
  padding: 0 10px;
}

.code-preview {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.code-preview code {
  white-space: pre-wrap;
  word-wrap: break-word;
}

:deep(.dark) .editor-wrapper {
  border-color: #4b5563;
}
</style>

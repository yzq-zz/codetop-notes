<script setup>
import { ref, onMounted, nextTick } from 'vue'

const GITHUB_TOKEN_KEY = 'codetop_github_token'
const GIST_ID_KEY = 'codetop_gist_id'
const GIST_FILENAME = '刷题笔记.md'

const problem = ref(null)
const token = ref('')
const content = ref('')
const status = ref('')
const statusType = ref('')
const saving = ref(false)
const editorRef = ref(null)
let editor = null

// 加载题目信息
onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const problemData = params.get('problem')
  if (problemData) {
    try {
      problem.value = JSON.parse(decodeURIComponent(problemData))
    } catch (e) {
      console.error('解析题目失败:', e)
    }
  }

  // 加载已保存的 token
  token.value = localStorage.getItem(GITHUB_TOKEN_KEY) || ''

  // 加载笔记
  await loadNote()

  // 初始化 CodeMirror
  await nextTick()
  initEditor()
  if (content.value) {
    editor.setValue(content.value)
  }
})

// 初始化编辑器
function initEditor() {
  const CodeMirror = window.CodeMirror
  editor = CodeMirror(editorRef.value, {
    value: content.value,
    mode: 'markdown',
    theme: 'material-darker',
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2,
    extraKeys: {
      'Ctrl-S': saveNote,
      'Cmd-S': saveNote
    }
  })
}

// 显示状态
function showStatus(message, type = '') {
  status.value = message
  statusType.value = type
  setTimeout(() => {
    if (status.value === message) {
      status.value = ''
      statusType.value = ''
    }
  }, 3000)
}

// 加载笔记
async function loadNote() {
  if (!token.value) {
    content.value = '# 欢迎使用刷题笔记\n\n请先输入 GitHub Token 开始使用。\n\n首次使用需要生成 Token：\n1. 打开 https://github.com/settings/tokens\n2. 生成新的 Personal Access Token\n3. 勾选 `gist` 权限\n4. 粘贴到上方输入框'
    return
  }

  const gistId = localStorage.getItem(GIST_ID_KEY + '_' + problem.value?.id)
  if (gistId) {
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${token.value}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (response.ok) {
        const gist = await response.json()
        const file = gist.files[GIST_FILENAME]
        if (file) {
          content.value = file.content
          showStatus('✓ 笔记加载成功', 'success')
          return
        }
      } else if (response.status === 404) {
        localStorage.removeItem(GIST_ID_KEY + '_' + problem.value?.id)
      }
    } catch (e) {
      showStatus('加载失败: ' + e.message, 'error')
    }
  }

  content.value = '# ' + problem.value?.title + ' 笔记\n\n## 思路\n\n\n\n## 代码\n\n```java\n\n```\n\n## 总结\n\n'
  showStatus('✓ 新建笔记', 'success')
}

// 保存笔记
async function saveNote() {
  if (!token.value) {
    showStatus('请先输入 GitHub Token', 'error')
    return
  }

  if (!problem.value) {
    showStatus('题目信息丢失', 'error')
    return
  }

  localStorage.setItem(GITHUB_TOKEN_KEY, token.value)
  const noteContent = editor ? editor.getValue() : content.value
  saving.value = true
  showStatus('保存中...')

  const gistId = localStorage.getItem(GIST_ID_KEY + '_' + problem.value.id)
  const gistData = {
    description: `刷题笔记 - ${problem.value.title} (#${problem.value.id})`,
    public: false,
    files: {
      [GIST_FILENAME]: { content: noteContent }
    }
  }

  try {
    let response
    if (gistId) {
      response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token.value}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(gistData)
      })
    } else {
      response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token.value}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(gistData)
      })
    }

    if (response.ok) {
      const gist = await response.json()
      if (!gistId) {
        localStorage.setItem(GIST_ID_KEY + '_' + problem.value.id, gist.id)
      }
      showStatus('✓ 笔记已保存', 'success')
    } else {
      const error = await response.json()
      showStatus('保存失败: ' + (error.message || response.status), 'error')
    }
  } catch (e) {
    showStatus('保存失败: ' + e.message, 'error')
  } finally {
    saving.value = false
  }
}

// 插入代码块
function insertCode() {
  if (!editor) return
  const lang = document.getElementById('langSelect')?.value || 'java'
  const cursor = editor.getCursor()
  const code = `\n\`\`\`${lang}\n\n\`\`\`\n`
  editor.replaceRange(code, cursor)
  editor.setCursor({ line: cursor.line + 2, ch: 0 })
  editor.focus()
}

// 插入加粗
function insertBold() {
  if (!editor) return
  const selection = editor.getSelection()
  const cursor = editor.getCursor()
  if (selection) {
    editor.replaceSelection(`**${selection}**`)
  } else {
    editor.replaceRange('****', cursor)
    editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 })
  }
  editor.focus()
}

// 插入斜体
function insertItalic() {
  if (!editor) return
  const selection = editor.getSelection()
  const cursor = editor.getCursor()
  if (selection) {
    editor.replaceSelection(`*${selection}*`)
  } else {
    editor.replaceRange('**', cursor)
    editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 })
  }
  editor.focus()
}
</script>

<template>
  <div class="note-page">
    <div class="header">
      <div class="problem-info">
        <span v-if="problem">#{{ problem.id }} {{ problem.title }}</span>
        <span v-else>加载中...</span>
        <a v-if="problem" :href="problem.link" target="_blank" class="link-btn">力扣链接</a>
      </div>
      <div class="token-section">
        <label>GitHub Token:</label>
        <input 
          type="password" 
          v-model="token" 
          placeholder="ghp_xxx"
          @change="localStorage.setItem(GITHUB_TOKEN_KEY, token)"
        >
        <button class="save-btn" @click="saveNote" :disabled="saving">
          {{ saving ? '保存中...' : '保存笔记' }}
        </button>
      </div>
    </div>

    <div v-if="status" :class="['status', statusType]">{{ status }}</div>

    <div class="toolbar">
      <button class="tool-btn" @click="insertCode">插入代码块</button>
      <button class="tool-btn" @click="insertBold">加粗</button>
      <button class="tool-btn" @click="insertItalic">斜体</button>
      <select id="langSelect" class="lang-select">
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="javascript">JavaScript</option>
        <option value="go">Go</option>
        <option value="sql">SQL</option>
      </select>
    </div>

    <div ref="editorRef" class="editor"></div>
  </div>
</template>

<style scoped>
.note-page {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.problem-info {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.link-btn {
  font-size: 0.9rem;
  color: var(--vp-c-brand);
}

.token-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.token-section label {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.token-section input {
  width: 280px;
  padding: 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text);
  font-family: monospace;
  font-size: 0.85rem;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status {
  text-align: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.status.success {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
}

.status.error {
  background: rgba(229, 115, 115, 0.2);
  color: #e57373;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tool-btn {
  padding: 0.4rem 0.8rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text);
  border-radius: 4px;
  cursor: pointer;
}

.tool-btn:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand);
}

.lang-select {
  padding: 0.4rem 0.8rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text);
  border-radius: 4px;
  cursor: pointer;
}

.editor {
  flex: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.editor :deep(.CodeMirror) {
  height: 100%;
  font-family: 'Fira Code', Consolas, monospace;
}
</style>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.16/theme/material-darker.css">

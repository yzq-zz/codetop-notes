<script setup>
import { ref, onMounted } from 'vue'

const problem = ref(null)
const content = ref('')
const status = ref('')
const statusType = ref('')
const saving = ref(false)
const token = ref('')
const GITHUB_TOKEN_KEY = 'codetop_github_token'
const GIST_ID_KEY = 'codetop_gist_id'
const GIST_FILENAME = '刷题笔记.md'

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const problemData = params.get('problem')
  if (problemData) {
    try {
      problem.value = JSON.parse(decodeURIComponent(problemData))
    } catch (e) {
      console.error('解析题目失败:', e)
    }
  }
  token.value = localStorage.getItem(GITHUB_TOKEN_KEY) || ''
  loadNote()
})

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
          showStatus('笔记加载成功', 'success')
          return
        }
      } else if (response.status === 404) {
        localStorage.removeItem(GIST_ID_KEY + '_' + problem.value?.id)
      }
    } catch (e) {
      showStatus('加载失败: ' + e.message, 'error')
    }
  }

  content.value = '# ' + (problem.value?.title || '题目') + ' 笔记\n\n## 思路\n\n\n\n## 代码\n\n```java\n\n```\n\n## 总结\n\n'
  showStatus('新建笔记', 'success')
}

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
  saving.value = true
  showStatus('保存中...')

  const gistId = localStorage.getItem(GIST_ID_KEY + '_' + problem.value.id)
  const gistData = {
    description: `刷题笔记 - ${problem.value.title} (#${problem.value.id})`,
    public: false,
    files: {
      [GIST_FILENAME]: { content: content.value }
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
      showStatus('笔记已保存', 'success')
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
</script>

<template>
  <div class="note-container">
    <div class="note-header">
      <h1 v-if="problem">#{{ problem.id }} {{ problem.title }}</h1>
      <h1 v-else>加载中...</h1>
      <a v-if="problem" :href="problem.link" target="_blank" class="link-btn">力扣链接</a>
    </div>

    <div class="note-content">
      <div class="token-row">
        <label>GitHub Token:</label>
        <input type="password" v-model="token" placeholder="ghp_xxx" @change="localStorage.setItem(GITHUB_TOKEN_KEY, token)" />
        <button class="save-btn" @click="saveNote" :disabled="saving">
          {{ saving ? '保存中...' : '保存笔记' }}
        </button>
      </div>

      <div v-if="status" :class="['status', statusType]">{{ status }}</div>

      <textarea v-model="content" class="editor" placeholder="在这里写笔记..." spellcheck="false"></textarea>
    </div>
  </div>
</template>

<style scoped>
.note-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.note-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.note-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.link-btn {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-size: 0.9rem;
}

.note-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.token-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.token-row label {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.token-row input {
  padding: 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text);
  font-family: monospace;
  font-size: 0.85rem;
  width: 280px;
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
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.status.success {
  background: rgba(129, 199, 132, 0.2);
  color: #81c784;
}

.status.error {
  background: rgba(229, 115, 115, 0.2);
  color: #e57373;
}

.editor {
  width: 100%;
  height: 500px;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text);
  font-family: 'Fira Code', Consolas, monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
}

.editor:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}
</style>

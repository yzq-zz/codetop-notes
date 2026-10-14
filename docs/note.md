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

async function loadNote() {
  if (!token.value) {
    content.value = '# 欢迎使用刷题笔记\n\n请先输入 GitHub Token 开始使用。'
    return
  }

  const gistId = localStorage.getItem(GIST_ID_KEY + '_' + problem.value?.id)
  if (gistId) {
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: { 'Authorization': `token ${token.value}` }
      })
      if (response.ok) {
        const gist = await response.json()
        const file = gist.files[GIST_FILENAME]
        if (file) {
          content.value = file.content
          showStatus('笔记加载成功')
          return
        }
      }
    } catch (e) {
      showStatus('加载失败', 'error')
    }
  }
  content.value = '# ' + (problem.value?.title || '题目') + ' 笔记\n\n## 思路\n\n\n\n## 代码\n\n```\n\n```\n\n## 总结\n\n'
}

async function saveNote() {
  if (!token.value || !problem.value) return
  localStorage.setItem(GITHUB_TOKEN_KEY, token.value)
  saving.value = true
  showStatus('保存中...')

  const gistId = localStorage.getItem(GIST_ID_KEY + '_' + problem.value.id)
  const gistData = {
    description: `刷题笔记 - ${problem.value.title}`,
    public: false,
    files: { [GIST_FILENAME]: { content: content.value } }
  }

  try {
    const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists'
    const method = gistId ? 'PATCH' : 'POST'
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `token ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gistData)
    })
    if (response.ok) {
      const gist = await response.json()
      if (!gistId) localStorage.setItem(GIST_ID_KEY + '_' + problem.value.id, gist.id)
      showStatus('笔记已保存')
    } else {
      showStatus('保存失败', 'error')
    }
  } catch (e) {
    showStatus('保存失败', 'error')
  } finally {
    saving.value = false
  }
}

function showStatus(msg, type = '') {
  status.value = msg
  statusType.value = type
  setTimeout(() => { if (status.value === msg) status.value = '' }, 3000)
}
</script>

<template>
  <div>
    <h1 v-if="problem">#{{ problem.id }} {{ problem.title }}</h1>
    <p v-if="problem"><a :href="problem.link" target="_blank">力扣链接</a></p>
    <p v-else>加载中...</p>
    <p>
      <label>GitHub Token: <input type="password" v-model="token" @change="localStorage.setItem(GITHUB_TOKEN_KEY, token)" /></label>
      <button @click="saveNote" :disabled="saving">{{ saving ? '保存中...' : '保存笔记' }}</button>
    </p>
    <p v-if="status" :style="{ color: statusType === 'error' ? 'red' : 'green' }">{{ status }}</p>
    <textarea v-model="content" rows="20" style="width: 100%; font-family: monospace;"></textarea>
  </div>
</template>

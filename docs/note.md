<script setup>
import { ref, onMounted } from 'vue'

const problem = ref(null)
const content = ref('')
const status = ref('')
const statusType = ref('')
const saving = ref(false)
const token = ref('')
const loaded = ref(false)

const CONFIG_GIST_FILE = 'codetop-config.json'
const DEFAULT_CONFIG_GIST_ID = 'fc8f728b94e65b97145e1de1354ff781' // 默认配置 Gist
const GIST_ID_KEY = 'codetop_gist_id'
const GIST_FILENAME = '刷题笔记.md'

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

  // 尝试从配置 Gist 加载 Token
  await loadConfig()
  loaded.value = true
  loadNote()
})

async function loadConfig() {
  const savedToken = localStorage.getItem('codetop_token')
  const savedConfigGistId = localStorage.getItem('codetop_config_gist_id') || DEFAULT_CONFIG_GIST_ID

  if (savedToken) {
    token.value = savedToken
    return
  }

  // 从配置 Gist 读取
  try {
    const response = await fetch(`https://api.github.com/gists/${savedConfigGistId}`)
    if (response.ok) {
      const gist = await response.json()
      const configFile = gist.files[CONFIG_GIST_FILE]
      if (configFile) {
        const config = JSON.parse(configFile.content)
        if (config.token) {
          token.value = config.token
          localStorage.setItem('codetop_token', config.token)
          localStorage.setItem('codetop_config_gist_id', savedConfigGistId)
          return
        }
      }
    }
  } catch (e) {
    console.error('加载配置失败:', e)
  }
}

async function saveConfig() {
  if (!token.value) return

  const savedConfigGistId = localStorage.getItem('codetop_config_gist_id')
  const configData = {
    token: token.value
  }

  try {
    const url = savedConfigGistId
      ? `https://api.github.com/gists/${savedConfigGistId}`
      : 'https://api.github.com/gists'
    const method = savedConfigGistId ? 'PATCH' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `token ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'codetop-notes 配置',
        public: false,
        files: { [CONFIG_GIST_FILE]: { content: JSON.stringify(configData) } }
      })
    })

    if (response.ok) {
      const gist = await response.json()
      if (!savedConfigGistId) {
        localStorage.setItem('codetop_config_gist_id', gist.id)
      }
      localStorage.setItem('codetop_token', token.value)
    }
  } catch (e) {
    console.error('保存配置失败:', e)
  }
}

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
  saving.value = true
  showStatus('保存中...')

  // 保存 Token 配置
  await saveConfig()

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
    <p v-else-if="!loaded">加载中...</p>
    <p>
      <label>GitHub Token: <input type="password" v-model="token" placeholder="输入 Token..." /></label>
      <button @click="saveNote" :disabled="saving || !loaded">{{ saving ? '保存中...' : '保存笔记' }}</button>
    </p>
    <p v-if="status" :style="{ color: statusType === 'error' ? 'red' : 'green' }">{{ status }}</p>
    <textarea v-model="content" rows="20" style="width: 100%; font-family: monospace;"></textarea>
  </div>
</template>

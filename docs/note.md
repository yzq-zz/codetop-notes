<script setup>
import { ref, onMounted } from 'vue'

const problem = ref(null)
const content = ref('')
const status = ref('')
const statusType = ref('')
const saving = ref(false)
const token = ref('')
const loaded = ref(false)

// GitHub 配置
const GH_REPO = 'yzq-zz/notes-data'
const NOTES_BRANCH = 'main'
const TOKEN_KEY = 'codetop_token'

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

  // 加载 Token
  token.value = localStorage.getItem(TOKEN_KEY) || ''
  loaded.value = true
  loadNote()
})

async function loadNote() {
  if (!problem.value) return

  if (!token.value) {
    content.value = '# 欢迎使用刷题笔记\n\n请先输入 GitHub Token 开始使用。'
    return
  }

  const filePath = `notes/${problem.value.id}.md`
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${filePath}?ref=${NOTES_BRANCH}`,
      {
        headers: { 'Authorization': `token ${token.value}` }
      }
    )

    if (response.ok) {
      const data = await response.json()
      // content 是 base64 编码的
      content.value = atob(data.content.replace(/\n/g, ''))
      showStatus('笔记加载成功')
    } else if (response.status === 404) {
      // 文件不存在，创建空模板
      content.value = `# ${problem.value.title} 笔记\n\n## 思路\n\n\n\n## 代码\n\n\`\`\`\n\n\`\`\`\n\n## 总结\n\n`
      showStatus('新建笔记')
    } else {
      showStatus('加载失败', 'error')
    }
  } catch (e) {
    showStatus('加载失败', 'error')
    console.error(e)
  }
}

async function saveNote() {
  if (!token.value || !problem.value) return

  saving.value = true
  showStatus('保存中...')

  const filePath = `notes/${problem.value.id}.md`
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
      message: `更新笔记: ${problem.value.title}`,
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

    <p>
      <label>GitHub Token:
        <input type="password" v-model="token" placeholder="输入 Token..." style="width: 300px;" />
      </label>
      <button @click="saveNote" :disabled="saving || !loaded">{{ saving ? '保存中...' : '保存笔记' }}</button>
    </p>
    <p style="font-size: 12px; color: #666;">
      提示：Token 需要有 repo 权限，笔记将保存到 yzq-zz/notes-data 仓库
      <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank">创建 Token</a>
    </p>
    <p v-if="status" :style="{ color: statusType === 'error' ? 'red' : 'green' }">{{ status }}</p>
    <textarea v-model="content" rows="25" style="width: 100%; font-family: monospace;"></textarea>
  </div>
</template>

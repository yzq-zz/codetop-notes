<script setup>
import { ref, onMounted } from 'vue'

const problems = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('/problems.json')
    const data = await response.json()
    problems.value = data.problems
  } catch (e) {
    console.error('加载题目失败:', e)
  } finally {
    loading.value = false
  }
})

const openNote = (problem) => {
  const encoded = encodeURIComponent(JSON.stringify(problem))
  window.location.href = `/note?problem=${encoded}`
}
</script>

# 题目列表

::: tip
点击题目名称跳转到力扣，点击「笔记」按钮查看/编辑笔记
:::

<div v-if="loading" class="loading">加载中...</div>

<table v-else class="problem-table">
  <thead>
    <tr>
      <th>#</th>
      <th>题目</th>
      <th>标签</th>
      <th>笔记</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="p in problems" :key="p.id">
      <td class="id-col">{{ p.id }}</td>
      <td>
        <a :href="p.link" target="_blank">{{ p.title }}</a>
      </td>
      <td class="tags-col">
        <span v-for="tag in p.tags" :key="tag" class="tag">{{ tag }}</span>
      </td>
      <td class="action-col">
        <button class="note-btn" @click="openNote(p)">笔记</button>
      </td>
    </tr>
  </tbody>
</table>

<style scoped>
.problem-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.problem-table th,
.problem-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 0.75rem 1rem;
  text-align: left;
}

.problem-table th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
}

.problem-table tr:hover {
  background: var(--vp-c-bg-soft);
}

.id-col {
  width: 60px;
  text-align: center;
  color: var(--vp-c-text-2);
}

.tags-col {
  width: 200px;
}

.tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  margin: 0.15rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 4px;
  font-size: 0.85rem;
}

.action-col {
  width: 80px;
  text-align: center;
}

.note-btn {
  padding: 0.4rem 0.8rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}

.note-btn:hover {
  opacity: 0.85;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-2);
}
</style>

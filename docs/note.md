<script setup>
import { ref, onMounted } from 'vue'

const problem = ref(null)

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
})
</script>

<template>
  <NoteEditor :problem="problem" />
</template>

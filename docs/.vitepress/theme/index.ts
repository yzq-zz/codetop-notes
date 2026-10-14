import DefaultTheme from 'vitepress/theme'
import NoteEditor from '../components/NoteEditor.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('NoteEditor', NoteEditor)
  }
}

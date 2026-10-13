import{_ as j,v as C,o as f,c as g,j as o,t as h,e as N,a0 as A,a1 as x,p as u,P}from"./chunks/framework.fSGIJph8.js";const $={class:"note-page"},E={class:"header"},G={class:"problem-info"},O={key:0},D={key:1},J=["href"],B={class:"token-section"},H=["disabled"],R=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"note.md","filePath":"note.md"}'),M={name:"note.md"},U=Object.assign(M,{setup(V){const b="codetop_github_token",d="codetop_gist_id",k="刷题笔记.md",e=u(null),s=u(""),c=u(""),p=u(""),y=u(""),v=u(!1),T=u(null);let m=null;C(async()=>{const t=new URLSearchParams(window.location.search).get("problem");if(t)try{e.value=JSON.parse(decodeURIComponent(t))}catch(i){console.error("解析题目失败:",i)}s.value=localStorage.getItem(b)||"",await I(),await P(),w(),c.value&&m.setValue(c.value)});function w(){const n=window.CodeMirror;m=n(T.value,{value:c.value,mode:"markdown",theme:"material-darker",lineNumbers:!0,lineWrapping:!0,indentUnit:2,tabSize:2,extraKeys:{"Ctrl-S":_,"Cmd-S":_}})}function l(n,t=""){p.value=n,y.value=t,setTimeout(()=>{p.value===n&&(p.value="",y.value="")},3e3)}async function I(){var t,i,a;if(!s.value){c.value=`# 欢迎使用刷题笔记

请先输入 GitHub Token 开始使用。

首次使用需要生成 Token：
1. 打开 https://github.com/settings/tokens
2. 生成新的 Personal Access Token
3. 勾选 \`gist\` 权限
4. 粘贴到上方输入框`;return}const n=localStorage.getItem(d+"_"+((t=e.value)==null?void 0:t.id));if(n)try{const r=await fetch(`https://api.github.com/gists/${n}`,{headers:{Authorization:`token ${s.value}`,Accept:"application/vnd.github.v3+json"}});if(r.ok){const S=(await r.json()).files[k];if(S){c.value=S.content,l("✓ 笔记加载成功","success");return}}else r.status===404&&localStorage.removeItem(d+"_"+((i=e.value)==null?void 0:i.id))}catch(r){l("加载失败: "+r.message,"error")}c.value="# "+((a=e.value)==null?void 0:a.title)+` 笔记

## 思路



## 代码

\`\`\`java

\`\`\`

## 总结

`,l("✓ 新建笔记","success")}async function _(){if(!s.value){l("请先输入 GitHub Token","error");return}if(!e.value){l("题目信息丢失","error");return}localStorage.setItem(b,s.value);const n=m?m.getValue():c.value;v.value=!0,l("保存中...");const t=localStorage.getItem(d+"_"+e.value.id),i={description:`刷题笔记 - ${e.value.title} (#${e.value.id})`,public:!1,files:{[k]:{content:n}}};try{let a;if(t?a=await fetch(`https://api.github.com/gists/${t}`,{method:"PATCH",headers:{Authorization:`token ${s.value}`,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json"},body:JSON.stringify(i)}):a=await fetch("https://api.github.com/gists",{method:"POST",headers:{Authorization:`token ${s.value}`,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json"},body:JSON.stringify(i)}),a.ok){const r=await a.json();t||localStorage.setItem(d+"_"+e.value.id,r.id),l("✓ 笔记已保存","success")}else{const r=await a.json();l("保存失败: "+(r.message||a.status),"error")}}catch(a){l("保存失败: "+a.message,"error")}finally{v.value=!1}}return(n,t)=>(f(),g("div",null,[o("template",null,[o("div",$,[o("div",E,[o("div",G,[e.value?(f(),g("span",O,"#"+h(e.value.id)+" "+h(e.value.title),1)):(f(),g("span",D,"加载中...")),e.value?(f(),g("a",{key:2,href:e.value.link,target:"_blank",class:"link-btn"},"力扣链接",8,J)):N("",!0)]),o("div",B,[t[2]||(t[2]=o("label",null,"GitHub Token:",-1)),A(o("input",{type:"password","onUpdate:modelValue":t[0]||(t[0]=i=>s.value=i),placeholder:"ghp_xxx",onChange:t[1]||(t[1]=i=>n.localStorage.setItem(b,s.value))},null,544),[[x,s.value]]),o("button",{class:"save-btn",onClick:_,disabled:v.value},h(v.value?"保存中...":"保存笔记"),9,H)])]),o("pre",null,[o("code",null,`<div v-if="status" :class="['status', statusType]">`+h(p.value)+`</div>

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
`,1)])])]),t[3]||(t[3]=o("link",{rel:"stylesheet",href:"https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.min.css"},null,-1)),t[4]||(t[4]=o("link",{rel:"stylesheet",href:"https://cdn.jsdelivr.net/npm/codemirror@5.65.16/theme/material-darker.css"},null,-1))]))}}),L=j(U,[["__scopeId","data-v-8ffe0ac5"]]);export{R as __pageData,L as default};

import{_ as T,v as I,o as g,c as h,j as s,t as _,e as j,a0 as w,a1 as N,p as c}from"./chunks/framework.fSGIJph8.js";const A={class:"note-page"},C={class:"header"},x={class:"problem-info"},$={key:0},E={key:1},G=["href"],O={class:"token-section"},P=["disabled"],z=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"note.md","filePath":"note.md"}'),D={name:"note.md"},J=Object.assign(D,{setup(B){const f="codetop_github_token",u="codetop_gist_id",m="刷题笔记.md",o=c(null),a=c(""),p=c(""),d=c(""),b=c(""),v=c(!1);I(()=>{const t=new URLSearchParams(window.location.search).get("problem");if(t)try{o.value=JSON.parse(decodeURIComponent(t))}catch(e){console.error("解析题目失败:",e)}a.value=localStorage.getItem(f)||"",y()});function l(n,t=""){d.value=n,b.value=t,setTimeout(()=>{d.value===n&&(d.value="",b.value="")},3e3)}async function y(){var t,e,i;if(!a.value){p.value=`# 欢迎使用刷题笔记

请先输入 GitHub Token 开始使用。

首次使用需要生成 Token：
1. 打开 https://github.com/settings/tokens
2. 生成新的 Personal Access Token
3. 勾选 \`gist\` 权限
4. 粘贴到上方输入框`;return}const n=localStorage.getItem(u+"_"+((t=o.value)==null?void 0:t.id));if(n)try{const r=await fetch(`https://api.github.com/gists/${n}`,{headers:{Authorization:`token ${a.value}`,Accept:"application/vnd.github.v3+json"}});if(r.ok){const k=(await r.json()).files[m];if(k){p.value=k.content,l("笔记加载成功","success");return}}else r.status===404&&localStorage.removeItem(u+"_"+((e=o.value)==null?void 0:e.id))}catch(r){l("加载失败: "+r.message,"error")}p.value="# "+(((i=o.value)==null?void 0:i.title)||"题目")+` 笔记

## 思路



## 代码

\`\`\`java

\`\`\`

## 总结

`,l("新建笔记","success")}async function S(){if(!a.value){l("请先输入 GitHub Token","error");return}if(!o.value){l("题目信息丢失","error");return}localStorage.setItem(f,a.value),v.value=!0,l("保存中...");const n=localStorage.getItem(u+"_"+o.value.id),t={description:`刷题笔记 - ${o.value.title} (#${o.value.id})`,public:!1,files:{[m]:{content:p.value}}};try{let e;if(n?e=await fetch(`https://api.github.com/gists/${n}`,{method:"PATCH",headers:{Authorization:`token ${a.value}`,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json"},body:JSON.stringify(t)}):e=await fetch("https://api.github.com/gists",{method:"POST",headers:{Authorization:`token ${a.value}`,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json"},body:JSON.stringify(t)}),e.ok){const i=await e.json();n||localStorage.setItem(u+"_"+o.value.id,i.id),l("笔记已保存","success")}else{const i=await e.json();l("保存失败: "+(i.message||e.status),"error")}}catch(e){l("保存失败: "+e.message,"error")}finally{v.value=!1}}return(n,t)=>(g(),h("div",null,[s("template",null,[s("div",A,[s("div",C,[s("div",x,[o.value?(g(),h("span",$,"#"+_(o.value.id)+" "+_(o.value.title),1)):(g(),h("span",E,"加载中...")),o.value?(g(),h("a",{key:2,href:o.value.link,target:"_blank",class:"link-btn"},"力扣链接",8,G)):j("",!0)]),s("div",O,[t[2]||(t[2]=s("label",null,"GitHub Token:",-1)),w(s("input",{type:"password","onUpdate:modelValue":t[0]||(t[0]=e=>a.value=e),placeholder:"ghp_xxx",onChange:t[1]||(t[1]=e=>n.localStorage.setItem(f,a.value))},null,544),[[N,a.value]]),s("button",{class:"save-btn",onClick:S,disabled:v.value},_(v.value?"保存中...":"保存笔记"),9,P)])]),s("pre",null,[s("code",null,`<div v-if="status" :class="['status', statusType]">`+_(d.value)+`</div>

<div class="toolbar">
  <button type="button" class="tool-btn" @click="insertCode">插入代码块</button>
  <button type="button" class="tool-btn" @click="insertBold">加粗</button>
  <select id="langSelect" class="lang-select">
    <option value="java">Java</option>
    <option value="python">Python</option>
    <option value="cpp">C++</option>
    <option value="javascript">JavaScript</option>
    <option value="go">Go</option>
    <option value="sql">SQL</option>
  </select>
</div>

<textarea 
  id="noteEditor"
  v-model="content"
  class="editor"
  placeholder="在这里写笔记..."
  spellcheck="false"
></textarea>
`,1)])])])]))}}),K=T(J,[["__scopeId","data-v-8d060414"]]);export{z as __pageData,K as default};

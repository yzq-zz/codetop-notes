import{_ as T,v as S,o as i,c as r,j as o,t as u,e as y,p as a}from"./chunks/framework.-YcK16M8.js";const N={class:"note-container"},w={class:"note-header"},x={key:0},E={key:1},G=["href"],D=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"note.md","filePath":"note.md"}'),j={name:"note.md"},B=Object.assign(j,{setup(K){const e=a(null),d=a(""),l=a(""),p=a(""),f=a(!1),v=a(""),k="codetop_github_token",h="codetop_gist_id",b="刷题笔记.md";S(()=>{const t=new URLSearchParams(window.location.search).get("problem");if(t)try{e.value=JSON.parse(decodeURIComponent(t))}catch(c){console.error("解析题目失败:",c)}v.value=localStorage.getItem(k)||"",I()});function _(n,t=""){l.value=n,p.value=t,setTimeout(()=>{l.value===n&&(l.value="",p.value="")},3e3)}async function I(){var t,c,m;if(!v.value){d.value=`# 欢迎使用刷题笔记

请先输入 GitHub Token 开始使用。

首次使用需要生成 Token：
1. 打开 https://github.com/settings/tokens
2. 生成新的 Personal Access Token
3. 勾选 \`gist\` 权限
4. 粘贴到上方输入框`;return}const n=localStorage.getItem(h+"_"+((t=e.value)==null?void 0:t.id));if(n)try{const s=await fetch(`https://api.github.com/gists/${n}`,{headers:{Authorization:`token ${v.value}`,Accept:"application/vnd.github.v3+json"}});if(s.ok){const g=(await s.json()).files[b];if(g){d.value=g.content,_("笔记加载成功","success");return}}else s.status===404&&localStorage.removeItem(h+"_"+((c=e.value)==null?void 0:c.id))}catch(s){_("加载失败: "+s.message,"error")}d.value="# "+(((m=e.value)==null?void 0:m.title)||"题目")+` 笔记

## 思路



## 代码

\`\`\`java

\`\`\`

## 总结

`,_("新建笔记","success")}return(n,t)=>(i(),r("div",null,[o("template",null,[o("div",N,[o("div",w,[e.value?(i(),r("h1",x,"#"+u(e.value.id)+" "+u(e.value.title),1)):(i(),r("h1",E,"加载中...")),e.value?(i(),r("a",{key:2,href:e.value.link,target:"_blank",class:"link-btn"},"力扣链接",8,G)):y("",!0)]),o("pre",null,[o("code",null,`<div class="note-content">
  <div class="token-row">
    <label>GitHub Token:</label>
    <input type="password" v-model="token" placeholder="ghp_xxx" @change="localStorage.setItem(GITHUB_TOKEN_KEY, token)" />
    <button class="save-btn" @click="saveNote" :disabled="saving">
      `+u(f.value?"保存中...":"保存笔记")+`
    </button>
  </div>

  <div v-if="status" :class="['status', statusType]">`+u(l.value)+`</div>

  <textarea v-model="content" class="editor" placeholder="在这里写笔记..." spellcheck="false"></textarea>
</div>
`,1)])])])]))}}),H=T(B,[["__scopeId","data-v-89207349"]]);export{D as __pageData,H as default};

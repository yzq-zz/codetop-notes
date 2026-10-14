import{v as j,o as v,c as f,j as s,t as m,e as y,a as D,a0 as b,a1 as I,N as G,p as l}from"./chunks/framework.fSGIJph8.js";const P={key:0},$={key:1},A=["href"],x={key:2},E=["disabled"],H=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"note.md","filePath":"note.md"}'),J={name:"note.md"},U=Object.assign(J,{setup(V){const a=l(null),i=l(""),d=l(""),k=l(""),g=l(!1),n=l(""),h=l(!1),T="codetop-config.json",_="codetop_gist_id",S="刷题笔记.md";j(async()=>{const e=new URLSearchParams(window.location.search).get("problem");if(e)try{a.value=JSON.parse(decodeURIComponent(e))}catch(o){console.error("解析题目失败:",o)}await w(),h.value=!0,C()});async function w(){const t=localStorage.getItem("codetop_token");if(t){n.value=t;return}}async function N(){if(!n.value)return;const t=localStorage.getItem("codetop_config_gist_id"),e={token:n.value};try{const o=t?`https://api.github.com/gists/${t}`:"https://api.github.com/gists",r=await fetch(o,{method:t?"PATCH":"POST",headers:{Authorization:`token ${n.value}`,"Content-Type":"application/json"},body:JSON.stringify({description:"codetop-notes 配置",public:!1,files:{[T]:{content:JSON.stringify(e)}}})});if(r.ok){const u=await r.json();t||localStorage.setItem("codetop_config_gist_id",u.id),localStorage.setItem("codetop_token",n.value)}}catch(o){console.error("保存配置失败:",o)}}async function C(){var e,o;if(!n.value){i.value=`# 欢迎使用刷题笔记

请先输入 GitHub Token 开始使用。`;return}const t=localStorage.getItem(_+"_"+((e=a.value)==null?void 0:e.id));if(t)try{const p=await fetch(`https://api.github.com/gists/${t}`,{headers:{Authorization:`token ${n.value}`}});if(p.ok){const u=(await p.json()).files[S];if(u){i.value=u.content,c("笔记加载成功");return}}}catch{c("加载失败","error")}i.value="# "+(((o=a.value)==null?void 0:o.title)||"题目")+` 笔记

## 思路



## 代码

\`\`\`

\`\`\`

## 总结

`}async function O(){if(!n.value||!a.value)return;g.value=!0,c("保存中..."),await N();const t=localStorage.getItem(_+"_"+a.value.id),e={description:`刷题笔记 - ${a.value.title}`,public:!1,files:{[S]:{content:i.value}}};try{const o=t?`https://api.github.com/gists/${t}`:"https://api.github.com/gists",r=await fetch(o,{method:t?"PATCH":"POST",headers:{Authorization:`token ${n.value}`,"Content-Type":"application/json"},body:JSON.stringify(e)});if(r.ok){const u=await r.json();t||localStorage.setItem(_+"_"+a.value.id,u.id),c("笔记已保存")}else c("保存失败","error")}catch{c("保存失败","error")}finally{g.value=!1}}function c(t,e=""){d.value=t,k.value=e,setTimeout(()=>{d.value===t&&(d.value="")},3e3)}return(t,e)=>(v(),f("div",null,[s("template",null,[s("div",null,[a.value?(v(),f("h1",P,"#"+m(a.value.id)+" "+m(a.value.title),1)):y("",!0),a.value?(v(),f("p",$,[s("a",{href:a.value.link,target:"_blank"},"力扣链接",8,A)])):h.value?y("",!0):(v(),f("p",x,"加载中...")),s("p",null,[s("label",null,[e[2]||(e[2]=D("GitHub Token: ",-1)),b(s("input",{type:"password","onUpdate:modelValue":e[0]||(e[0]=o=>n.value=o),placeholder:"输入 Token..."},null,512),[[I,n.value]])]),s("button",{onClick:O,disabled:g.value||!h.value},m(g.value?"保存中...":"保存笔记"),9,E)]),d.value?(v(),f("p",{key:3,style:G({color:k.value==="error"?"red":"green"})},m(d.value),5)):y("",!0),b(s("textarea",{"onUpdate:modelValue":e[1]||(e[1]=o=>i.value=o),rows:"20",style:{width:"100%","font-family":"monospace"}},null,512),[[I,i.value]])])])]))}});export{H as __pageData,U as default};

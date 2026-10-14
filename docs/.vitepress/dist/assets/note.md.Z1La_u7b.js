import{v as N,o as c,c as d,j as s,t as f,e as k,a as C,a0 as S,a1 as I,N as D,p as r}from"./chunks/framework.fSGIJph8.js";const E={key:0},O={key:1},$=["href"],j={key:2},G=["disabled"],x=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"note.md","filePath":"note.md"}'),P={name:"note.md"},A=Object.assign(P,{setup(U){const a=r(null),l=r(""),u=r(""),y=r(""),v=r(!1),n=r(""),g="codetop_github_token",h="codetop_gist_id",b="刷题笔记.md";N(()=>{const e=new URLSearchParams(window.location.search).get("problem");if(e)try{a.value=JSON.parse(decodeURIComponent(e))}catch(o){console.error("解析题目失败:",o)}n.value=localStorage.getItem(g)||"",T()});async function T(){var e,o;if(!n.value){l.value=`# 欢迎使用刷题笔记

请先输入 GitHub Token 开始使用。`;return}const t=localStorage.getItem(h+"_"+((e=a.value)==null?void 0:e.id));if(t)try{const p=await fetch(`https://api.github.com/gists/${t}`,{headers:{Authorization:`token ${n.value}`}});if(p.ok){const m=(await p.json()).files[b];if(m){l.value=m.content,i("笔记加载成功");return}}}catch{i("加载失败","error")}l.value="# "+(((o=a.value)==null?void 0:o.title)||"题目")+` 笔记

## 思路



## 代码

\`\`\`

\`\`\`

## 总结

`}async function w(){if(!n.value||!a.value)return;localStorage.setItem(g,n.value),v.value=!0,i("保存中...");const t=localStorage.getItem(h+"_"+a.value.id),e={description:`刷题笔记 - ${a.value.title}`,public:!1,files:{[b]:{content:l.value}}};try{const o=t?`https://api.github.com/gists/${t}`:"https://api.github.com/gists",_=await fetch(o,{method:t?"PATCH":"POST",headers:{Authorization:`token ${n.value}`,"Content-Type":"application/json"},body:JSON.stringify(e)});if(_.ok){const m=await _.json();t||localStorage.setItem(h+"_"+a.value.id,m.id),i("笔记已保存")}else i("保存失败","error")}catch{i("保存失败","error")}finally{v.value=!1}}function i(t,e=""){u.value=t,y.value=e,setTimeout(()=>{u.value===t&&(u.value="")},3e3)}return(t,e)=>(c(),d("div",null,[s("template",null,[s("div",null,[a.value?(c(),d("h1",E,"#"+f(a.value.id)+" "+f(a.value.title),1)):k("",!0),a.value?(c(),d("p",O,[s("a",{href:a.value.link,target:"_blank"},"力扣链接",8,$)])):(c(),d("p",j,"加载中...")),s("p",null,[s("label",null,[e[3]||(e[3]=C("GitHub Token: ",-1)),S(s("input",{type:"password","onUpdate:modelValue":e[0]||(e[0]=o=>n.value=o),onChange:e[1]||(e[1]=o=>t.localStorage.setItem(g,n.value))},null,544),[[I,n.value]])]),s("button",{onClick:w,disabled:v.value},f(v.value?"保存中...":"保存笔记"),9,G)]),u.value?(c(),d("p",{key:3,style:D({color:y.value==="error"?"red":"green"})},f(u.value),5)):k("",!0),S(s("textarea",{"onUpdate:modelValue":e[2]||(e[2]=o=>l.value=o),rows:"20",style:{width:"100%","font-family":"monospace"}},null,512),[[I,l.value]])])])]))}});export{x as __pageData,A as default};

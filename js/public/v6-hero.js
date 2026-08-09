
import { watchCourses, watchSettings } from "../lib/store.js";

const $=(s,r=document)=>r.querySelector(s);
let courses=[],settings={};

function esc(v=""){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function money(v){const n=Number(v);return Number.isFinite(n)?`₹${n.toLocaleString("en-IN")}`:""}
function imageOf(c){return c.imageData||c.image||""}

function courseCard(c){
  const image=imageOf(c),title=c.title||"Untitled Course",tg=c.telegram||settings.telegram||"#";
  return `<article class="course-card">
    <a class="course-media" href="course.html?id=${encodeURIComponent(c.id)}">
      ${image?`<img src="${esc(image)}" alt="${esc(title)}" loading="lazy">`:`<div class="placeholder-art">${esc(c.category||"COURSE")}</div>`}
      <div class="course-overlay"><div class="course-title"><span class="play-dot"></span><span>${esc(title)}</span></div></div>
    </a>
    <div class="course-meta"><span>${esc(c.category||"Course")}</span><strong>${money(c.price)||"Ask Price"}</strong></div>
    <a class="course-button" href="${esc(tg)}" target="_blank" rel="noopener">Get Course ↗</a>
  </article>`;
}

function renderTrending(){
  const live=courses.filter(c=>c.published!==false);
  const trending=live.filter(c=>c.trending);
  const list=trending.length?trending:live;
  $("#trendingRow").innerHTML=list.length?list.map(courseCard).join(""):`<div class="loading-state">Add courses from Admin → Courses. Mark them Trending to show them here.</div>`;
}

function renderCollage(){
  const live=courses.filter(c=>c.published!==false);
  const featured=live.filter(c=>c.featured);
  const source=(featured.length?featured:live);
  const fallbackNames=["AI","CODING","VIDEO EDITING","MARKETING","FINANCE","FREELANCING","DESIGN","SKILLS"];
  const classes=["card-a","card-b","card-c","card-d","card-e","card-f","card-g","card-h"];

  const slots=[];
  for(let i=0;i<8;i++){
    const c=source.length?source[i%source.length]:null;
    if(c){
      const img=imageOf(c);
      slots.push(`<article class="float-card ${classes[i]}">
        ${img?`<img src="${esc(img)}" alt="${esc(c.title||"Course")}">`:`<div class="placeholder-art">${esc(c.category||fallbackNames[i])}</div>`}
      </article>`);
    }else{
      slots.push(`<article class="float-card ${classes[i]}"><div class="placeholder-art">${fallbackNames[i]}</div></article>`);
    }
  }
  $("#heroCollage").innerHTML=slots.join("");
}

function renderCategories(){
  const cats=[...new Set(courses.filter(c=>c.published!==false).map(c=>c.category).filter(Boolean))].sort();
  $("#categoryChips").innerHTML=cats.map(cat=>`<button data-cat="${esc(cat)}">${esc(cat)}</button>`).join("");
  document.querySelectorAll("[data-cat]").forEach(btn=>{
    btn.onclick=()=>{$("#heroSearch").value=btn.dataset.cat;renderSearch(btn.dataset.cat);$("#heroSearch").focus()}
  });
}

function renderSearch(q){
  const host=$("#searchDropdown"),query=q.trim().toLowerCase();
  if(!query){host.classList.add("hidden");host.innerHTML="";return}
  const matches=courses.filter(c=>{
    if(c.published===false)return false;
    const hay=[c.title,c.creator,c.category,c.description,...(Array.isArray(c.tags)?c.tags:[])].join(" ").toLowerCase();
    return hay.includes(query);
  }).slice(0,7);
  host.innerHTML=matches.length?matches.map(c=>{
    const img=imageOf(c);
    return `<a class="search-hit" href="course.html?id=${encodeURIComponent(c.id)}">
      ${img?`<img src="${esc(img)}" alt="">`:`<div style="width:52px;height:36px;border-radius:6px;background:#171b23"></div>`}
      <div><b>${esc(c.title||"Course")}</b><small>${esc(c.category||"Course")}</small></div>
    </a>`;
  }).join(""):`<div class="search-hit"><div><b>No course found</b><small>Try another keyword</small></div></div>`;
  host.classList.remove("hidden");
}

$("#heroSearch").addEventListener("input",e=>renderSearch(e.target.value));
document.addEventListener("click",e=>{if(!e.target.closest(".nav-search"))$("#searchDropdown").classList.add("hidden")});
$("#slidePrev").onclick=()=>$("#trendingRow").scrollBy({left:-550,behavior:"smooth"});
$("#slideNext").onclick=()=>$("#trendingRow").scrollBy({left:550,behavior:"smooth"});

watchSettings(s=>{
  settings=s||{};
  const tg=settings.telegram||"#";
  $("#topTelegram").href=tg;
  $("#premiumTelegram").href=tg;
},console.error);

watchCourses(list=>{
  courses=list||[];
  renderTrending();
  renderCollage();
  renderCategories();
},console.error);

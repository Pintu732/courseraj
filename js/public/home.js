
import { $, debounce } from "../lib/dom.js";
import { watchCourses, watchCategories, watchSettings, watchMedia } from "../lib/store.js";
import { applySettings, applyLogoMedia, applyHeroMedia, applyFaviconMedia, DEFAULTS } from "./common.js";
import { courseCard } from "./cards.js";

let courses=[], categories=[], settings={...DEFAULTS};

function published(list){ return list.filter(c=>c.published !== false); }

function row(host,list,empty="No courses yet"){
  host.innerHTML=list.length ? list.map(c=>courseCard(c,settings.telegram)).join("") : `<div class="empty">${empty}</div>`;
}

function render(){
  const live=published(courses);
  $("#courseCount").textContent=live.length;
  const cats=[...new Set(live.map(c=>c.category).filter(Boolean))];
  $("#categoryCount").textContent=cats.length;

  row($("#featuredRow"),live.filter(c=>c.featured),"No featured courses selected.");
  row($("#trendingRow"),live.filter(c=>c.trending),"No trending courses selected.");
  $("#allGrid").innerHTML=live.length?live.map(c=>courseCard(c,settings.telegram)).join(""):`<div class="empty">No courses published.</div>`;

  const visibleCats = categories.filter(c=>c.visible !== false);
  const categoryNames = visibleCats.length ? visibleCats.map(c=>c.name) : cats.sort();
  $("#categoryChips").innerHTML=categoryNames.map(name=>`<button data-cat="${name}">${name}</button>`).join("");

  $("#categoryRows").innerHTML=categoryNames.map((name,i)=>{
    const list=live.filter(c=>c.category===name);
    if(!list.length) return "";
    return `<section class="section">
      <div class="section-head"><div><span class="eyebrow">CATEGORY</span><h2>${name}</h2></div><span class="small-muted">${list.length} courses</span></div>
      <div class="course-row">${list.map(c=>courseCard(c,settings.telegram)).join("")}</div>
    </section>`;
  }).join("");

  document.querySelectorAll("[data-cat]").forEach(btn=>{
    btn.onclick=()=>{
      const q=btn.dataset.cat.toLowerCase();
      $("#searchInput").value=btn.dataset.cat;
      renderSearch(q);
      $("#searchResultsSection").scrollIntoView({behavior:"smooth"});
    };
  });
}

function renderSearch(q){
  const host=$("#searchResults");
  if(!q){
    $("#searchResultsSection").classList.add("hidden");
    return;
  }
  const list=published(courses).filter(c=>{
    const hay=[c.title,c.creator,c.category,c.description,c.badge,...(Array.isArray(c.tags)?c.tags:[])].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  $("#searchResultsSection").classList.remove("hidden");
  row(host,list,"No matching course found.");
}

$("#searchInput")?.addEventListener("input",debounce(e=>renderSearch(e.target.value.trim()),120));
$("#clearSearch")?.addEventListener("click",()=>{ $("#searchInput").value=""; renderSearch(""); });

watchSettings(s=>{settings={...settings,...s};applySettings(settings);render();},console.error);
watchCourses(c=>{courses=c;render();},err=>{$("#allGrid").innerHTML=`<div class="error-box">Could not load courses. ${err.code||""}</div>`});
watchCategories(c=>{categories=c;render();},console.error);

watchMedia("logo",applyLogoMedia,console.error);
watchMedia("hero",applyHeroMedia,console.error);
watchMedia("favicon",applyFaviconMedia,console.error);

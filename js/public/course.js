
import { $, esc } from "../lib/dom.js";
import { money } from "../lib/format.js";
import { watchCourses, watchSettings, watchMedia } from "../lib/store.js";
import { applySettings, applyLogoMedia, applyFaviconMedia, DEFAULTS } from "./common.js";

const id=new URLSearchParams(location.search).get("id");
let settings={...DEFAULTS};

function render(c){
  if(!c || c.published===false){
    $("#courseView").innerHTML='<div class="empty">Course not found.</div>'; return;
  }
  const tg=c.telegram||settings.telegram;
  const cover=c.imageData||c.image||"";
  $("#courseView").innerHTML=`
    <div class="detail-poster">${cover?`<img src="${esc(cover)}" alt="${esc(c.title||"Course")}">`:`<div class="poster-fallback"><span>${esc(c.category||"Skill")}</span><strong>${esc(c.title||"Course")}</strong></div>`}</div>
    <div class="detail-copy">
      <span class="eyebrow">${esc(c.category||"COURSE")}</span>
      <h1>${esc(c.title||"Untitled Course")}</h1>
      <p class="creator">by ${esc(c.creator||"Creator")}</p>
      <p class="description">${esc(c.description||"Course details available on Telegram.")}</p>
      <div class="detail-price">${c.oldPrice?`<del>${money(c.oldPrice)}</del>`:""}<strong>${money(c.price)||"Ask Price"}</strong></div>
      <div class="tag-list">${(c.tags||[]).map(t=>`<span>${esc(t)}</span>`).join("")}</div>
      <a class="btn btn-primary" href="${esc(tg)}" target="_blank" rel="noopener">Get Course on Telegram ↗</a>
    </div>`;
  document.title=`${c.title||"Course"} — ${settings.brandName||"Courseraj"}`;
}
let cached=[];
watchSettings(s=>{settings={...settings,...s};applySettings(settings);const c=cached.find(x=>x.id===id);if(c)render(c);},console.error);
watchCourses(list=>{cached=list;render(list.find(x=>x.id===id));},console.error);

watchMedia("logo",applyLogoMedia,console.error);
watchMedia("favicon",applyFaviconMedia,console.error);

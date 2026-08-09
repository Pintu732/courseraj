
import { $, debounce } from "../lib/dom.js";
import { watchCourses, watchSettings, watchMedia } from "../lib/store.js";
import { applySettings, applyLogoMedia, applyFaviconMedia, DEFAULTS } from "./common.js";
import { courseCard } from "./cards.js";

let courses=[],settings={...DEFAULTS};

function render(q=""){
  const live=courses.filter(c=>c.published!==false);
  const filtered=!q?live:live.filter(c=>[c.title,c.creator,c.category,c.description,...(c.tags||[])].join(" ").toLowerCase().includes(q.toLowerCase()));
  $("#coursesGrid").innerHTML=filtered.length?filtered.map(c=>courseCard(c,settings.telegram)).join(""):`<div class="empty">No courses found.</div>`;
  $("#resultsCount").textContent=`${filtered.length} course${filtered.length===1?"":"s"}`;
}
$("#courseSearch")?.addEventListener("input",debounce(e=>render(e.target.value.trim()),120));
watchSettings(s=>{settings={...settings,...s};applySettings(settings);render();},console.error);
watchCourses(c=>{courses=c;render();},console.error);

watchMedia("logo",applyLogoMedia,console.error);
watchMedia("favicon",applyFaviconMedia,console.error);

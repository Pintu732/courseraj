
export const $ = (selector, root=document) => root.querySelector(selector);
export const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

export function esc(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

export function setText(selector, value){
  const el = $(selector);
  if(el && value !== undefined && value !== null) el.textContent = String(value);
}

export function setHref(selector, value){
  const el = $(selector);
  if(el && value) el.href = value;
}

export function debounce(fn, wait=180){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...args),wait);
  };
}


export function money(value){
  if(value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : String(value);
}

export function slugify(value=""){
  return String(value).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");
}

export function tagsFromInput(value=""){
  return value.split(",").map(x=>x.trim()).filter(Boolean);
}

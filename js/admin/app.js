
import { $, $$, esc } from "../lib/dom.js";
import { tagsFromInput } from "../lib/format.js";
import { compressImage, prettyBytes } from "../lib/images.js";
import { login, logout, watchAdmin } from "./auth.js";
import {
  watchCourses,watchCategories,watchSettings,watchMedia,
  saveCourse,removeCourse,saveCategory,removeCategory,saveSettings,saveMedia,clearMedia
} from "../lib/store.js";

let courses=[],categories=[],settings={};
let currentCourseImageData="";
let currentCategoryImageData="";

const views={dashboard:$("#view-dashboard"),courses:$("#view-courses"),categories:$("#view-categories"),settings:$("#view-settings")};

function showView(name){
  Object.entries(views).forEach(([k,v])=>v?.classList.toggle("hidden",k!==name));
  $$("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  if($("#mobileTitle")) $("#mobileTitle").textContent=name[0].toUpperCase()+name.slice(1);
  if($("#mobileNav")) $("#mobileNav").value=name;
}
$$("[data-view]").forEach(b=>b.onclick=()=>showView(b.dataset.view));
$("#mobileNav")?.addEventListener("change",e=>showView(e.target.value));

$("#loginForm").onsubmit=async e=>{
  e.preventDefault();
  const btn=$("#loginBtn"),msg=$("#loginMsg");
  btn.disabled=true;btn.textContent="Signing in…";msg.textContent="";
  try{ await login($("#loginEmail").value.trim(),$("#loginPassword").value); }
  catch(err){msg.textContent=err.message.includes("authorized")?err.message:"Login failed. Check email/password.";}
  finally{btn.disabled=false;btn.textContent="Sign In";}
};
$("#logoutBtn").onclick=logout;
$("#togglePassword").onclick=()=>{
  const p=$("#loginPassword"); p.type=p.type==="password"?"text":"password"; $("#togglePassword").textContent=p.type==="password"?"Show":"Hide";
};

watchAdmin(user=>{
  $("#loginScreen").classList.toggle("hidden",!!user);
  $("#adminApp").classList.toggle("hidden",!user);
  if(user){$("#adminEmail").textContent=user.email;showView("dashboard");}
});

function refreshStats(){
  $("#statCourses").textContent=courses.length;
  $("#statPublished").textContent=courses.filter(c=>c.published!==false).length;
  $("#statCategories").textContent=categories.length;
  $("#statFeatured").textContent=courses.filter(c=>c.featured).length;
}

function renderCategoryOptions(selected=""){
  const el=$("#category");
  if(!el)return;
  el.innerHTML=`<option value="">Select category</option>`+
    categories
      .filter(c=>c.visible!==false)
      .map(c=>`<option value="${esc(c.name||"")}">${esc(c.name||"")}</option>`)
      .join("");
  if(selected) el.value=selected;
}

function renderCourseList(){
  const q=$("#adminCourseSearch").value.trim().toLowerCase();
  const list=!q?courses:courses.filter(c=>[c.title,c.creator,c.category,c.badge].join(" ").toLowerCase().includes(q));
  $("#courseList").innerHTML=list.length?list.map(c=>`
    <article class="admin-list-card">
      <div class="thumb">${(c.imageData||c.image)?`<img src="${esc(c.imageData||c.image)}" alt="">`:`<span>No image</span>`}</div>
      <div class="grow"><h3>${esc(c.title||"Untitled")}</h3><p>${esc(c.category||"Uncategorized")} • ${esc(c.creator||"Creator")}</p>
      <div class="pills"><span>₹${c.price??"-"}</span>${c.published===false?"<span>Hidden</span>":"<span>Published</span>"}${c.featured?"<span>Featured</span>":""}${c.trending?"<span>Trending</span>":""}</div></div>
      <div class="actions"><button data-edit-course="${c.id}">Edit</button><button class="danger" data-delete-course="${c.id}">Delete</button></div>
    </article>`).join(""):`<div class="empty">No courses found.</div>`;

  $$("[data-edit-course]").forEach(b=>b.onclick=()=>editCourse(b.dataset.editCourse));
  $$("[data-delete-course]").forEach(b=>b.onclick=()=>deleteCourse(b.dataset.deleteCourse));
}
$("#adminCourseSearch").oninput=renderCourseList;

function setCoursePreview(src=""){
  const p=$("#courseImagePreview");
  p.innerHTML=src?`<img src="${src}" alt="Preview">`:`<span>No uploaded image</span>`;
}
function resetCourseForm(){
  $("#courseForm").reset(); $("#courseId").value=""; $("#courseFormTitle").textContent="Add Course"; $("#courseSaveMsg").textContent="";
  $("#published").checked=true; currentCourseImageData=""; setCoursePreview("");
  renderCategoryOptions("");
  $("#courseImageStatus").textContent="Images are automatically resized and compressed before saving.";
}
$("#newCourseBtn").onclick=()=>{resetCourseForm();$("#courseEditor").classList.remove("hidden");};
$("#cancelCourseBtn").onclick=()=>$("#courseEditor").classList.add("hidden");

function editCourse(id){
  const c=courses.find(x=>x.id===id); if(!c)return;
  $("#courseEditor").classList.remove("hidden");$("#courseFormTitle").textContent="Edit Course";$("#courseId").value=id;
  ["title","creator","price","oldPrice","rating","badge","image","telegram","description","order"].forEach(k=>$("#"+k).value=c[k]??"");
  renderCategoryOptions(c.category||"");
  $("#tags").value=(c.tags||[]).join(", ");
  currentCourseImageData=c.imageData||"";
  setCoursePreview(currentCourseImageData||c.image||"");
  ["featured","trending","published"].forEach(k=>$("#"+k).checked=k==="published"?c[k]!==false:Boolean(c[k]));
  window.scrollTo({top:0,behavior:"smooth"});
}
async function deleteCourse(id){
  const c=courses.find(x=>x.id===id); if(!confirm(`Delete "${c?.title||"this course"}"?`))return;
  try{await removeCourse(id);}catch(e){alert(e.message);}
}

$("#courseImageFile")?.addEventListener("change",async e=>{
  const file=e.target.files?.[0]; if(!file)return;
  const status=$("#courseImageStatus");
  status.textContent="Compressing image…";
  try{
    const out=await compressImage(file,{maxWidth:1000,maxHeight:625,targetBytes:180*1024});
    currentCourseImageData=out.dataUrl;
    setCoursePreview(out.dataUrl);
    status.textContent=`Ready • ${out.width}×${out.height} • ${prettyBytes(out.bytes)}`;
  }catch(err){
    currentCourseImageData="";
    setCoursePreview("");
    status.textContent=err.message;
  }
});
$("#removeCourseImage")?.addEventListener("click",()=>{
  currentCourseImageData="";
  $("#courseImageFile").value="";
  setCoursePreview("");
  $("#courseImageStatus").textContent="Uploaded image removed. URL fallback may still be used.";
});

$("#courseForm").onsubmit=async e=>{
  e.preventDefault(); const msg=$("#courseSaveMsg"),btn=$("#saveCourseBtn");
  msg.textContent="";
  if(!$("#category").value){
    msg.textContent="Please select a category.";
    msg.className="form-msg error";
    return;
  }
  btn.disabled=true;
  const payload={
    title:$("#title").value.trim(),creator:$("#creator").value.trim(),category:$("#category").value,
    price:$("#price").value?Number($("#price").value):null,oldPrice:$("#oldPrice").value?Number($("#oldPrice").value):null,
    rating:$("#rating").value?Number($("#rating").value):null,badge:$("#badge").value.trim(),image:$("#image").value.trim(),imageData:currentCourseImageData,
    telegram:$("#telegram").value.trim(),description:$("#description").value.trim(),tags:tagsFromInput($("#tags").value),
    order:$("#order").value?Number($("#order").value):9999,featured:$("#featured").checked,trending:$("#trending").checked,published:$("#published").checked
  };
  try{await saveCourse($("#courseId").value,payload);msg.textContent="Saved successfully.";msg.className="form-msg success";setTimeout(()=>$("#courseEditor").classList.add("hidden"),500);}
  catch(err){msg.textContent=err.message;msg.className="form-msg error";}
  finally{btn.disabled=false;}
};

function setCategoryPreview(src=""){
  const p=$("#categoryImagePreview");
  if(!p)return;
  p.innerHTML=src?`<img src="${src}" alt="Category preview">`:`<span>No category image</span>`;
}

function renderCategories(){
  $("#categoryList").innerHTML=categories.length?categories.map(c=>{
    const count=courses.filter(x=>x.category===c.name).length;
    return `
    <article class="admin-list-card">
      <div class="thumb">${c.imageData?`<img src="${esc(c.imageData)}" alt="">`:`<span>No image</span>`}</div>
      <div class="grow">
        <h3>${esc(c.name||"Unnamed")}</h3>
        <p>${count} course${count===1?"":"s"} • Order ${c.order??9999} • ${c.visible===false?"Hidden":"Visible"}</p>
        ${c.description?`<small>${esc(c.description)}</small>`:""}
      </div>
      <div class="actions">
        <button data-edit-cat="${c.id}">Edit</button>
        <button class="danger" data-delete-cat="${c.id}">Delete</button>
      </div>
    </article>`;
  }).join(""):`<div class="empty">No categories yet.</div>`;

  $$("[data-edit-cat]").forEach(b=>b.onclick=()=>editCategory(b.dataset.editCat));
  $$("[data-delete-cat]").forEach(b=>b.onclick=()=>deleteCategory(b.dataset.deleteCat));
}

function resetCat(){
  $("#categoryForm").reset();
  $("#categoryId").value="";
  $("#categoryVisible").checked=true;
  $("#categoryFormTitle").textContent="Add Category";
  $("#categorySaveMsg").textContent="";
  currentCategoryImageData="";
  setCategoryPreview("");
  $("#categoryImageStatus").textContent="Recommended: 1000×625 landscape image. It will be compressed automatically.";
}
$("#newCategoryBtn").onclick=()=>{$("#categoryEditor").classList.remove("hidden");resetCat();};
$("#cancelCategoryBtn").onclick=()=>$("#categoryEditor").classList.add("hidden");

function editCategory(id){
  const c=categories.find(x=>x.id===id);if(!c)return;
  $("#categoryEditor").classList.remove("hidden");
  $("#categoryFormTitle").textContent="Edit Category";
  $("#categoryId").value=id;
  $("#categoryName").value=c.name||"";
  $("#categoryDescription").value=c.description||"";
  $("#categoryOrder").value=c.order??9999;
  $("#categoryVisible").checked=c.visible!==false;
  currentCategoryImageData=c.imageData||"";
  setCategoryPreview(currentCategoryImageData);
  $("#categoryImageStatus").textContent=currentCategoryImageData?"Current category image loaded.":"No category image uploaded.";
  window.scrollTo({top:0,behavior:"smooth"});
}

async function deleteCategory(id){
  const c=categories.find(x=>x.id===id);
  const count=courses.filter(x=>x.category===c?.name).length;
  if(count>0){
    alert(`This category has ${count} course(s). Move those courses to another category first.`);
    return;
  }
  if(confirm("Delete this category?")) await removeCategory(id);
}

$("#categoryImageFile")?.addEventListener("change",async e=>{
  const file=e.target.files?.[0]; if(!file)return;
  const status=$("#categoryImageStatus");
  status.textContent="Compressing image…";
  try{
    const out=await compressImage(file,{maxWidth:1000,maxHeight:625,targetBytes:180*1024});
    currentCategoryImageData=out.dataUrl;
    setCategoryPreview(out.dataUrl);
    status.textContent=`Ready • ${out.width}×${out.height} • ${prettyBytes(out.bytes)}`;
  }catch(err){
    currentCategoryImageData="";
    setCategoryPreview("");
    status.textContent=err.message;
  }
});

$("#removeCategoryImage")?.addEventListener("click",()=>{
  currentCategoryImageData="";
  $("#categoryImageFile").value="";
  setCategoryPreview("");
  $("#categoryImageStatus").textContent="Category image removed. Save the category to apply.";
});

$("#categoryForm").onsubmit=async e=>{
  e.preventDefault();
  const id=$("#categoryId").value;
  const name=$("#categoryName").value.trim();
  const msg=$("#categorySaveMsg");
  const btn=$("#saveCategoryBtn");
  msg.textContent="";

  const duplicate=categories.find(c=>c.id!==id && (c.name||"").toLowerCase()===name.toLowerCase());
  if(duplicate){
    msg.textContent="A category with this name already exists.";
    msg.className="form-msg error";
    return;
  }

  btn.disabled=true;
  try{
    await saveCategory(id,{
      name,
      description:$("#categoryDescription").value.trim(),
      imageData:currentCategoryImageData,
      order:Number($("#categoryOrder").value)||9999,
      visible:$("#categoryVisible").checked
    });
    msg.textContent="Category saved successfully.";
    msg.className="form-msg success";
    setTimeout(()=>$("#categoryEditor").classList.add("hidden"),450);
  }catch(err){
    msg.textContent=err.message;
    msg.className="form-msg error";
  }finally{
    btn.disabled=false;
  }
};

function fillSettings(s){
  const defaults={
    brandName:"Courseraj",tagline:"Premium skill courses. Direct Telegram access.",
    heroTitle:"Learn skills that move you forward.",heroSubtitle:"Discover practical skill courses across AI, editing, marketing, coding, spoken English, freelancing and more.",
    telegram:"",announcement:"New skill courses added regularly",accentColor:"#E50914",logoUrl:"assets/icons/logo.svg",
    footerText:"Skill course discovery. Direct Telegram access.",featuredTitle:"Featured Courses",trendingTitle:"Trending Now",
    allCoursesTitle:"All Courses",categoriesTitle:"Explore by Skill",seoTitle:"Courseraj — Premium Skill Courses",seoDescription:"Discover practical skill courses and connect on Telegram."
  };
  const x={...defaults,...s};
  Object.keys(defaults).forEach(k=>{const el=$("#set-"+k);if(el)el.value=x[k]??"";});
  $("#set-announcementEnabled").checked=x.announcementEnabled!==false;
}
$("#settingsForm").onsubmit=async e=>{
  e.preventDefault();const msg=$("#settingsMsg");
  const keys=["brandName","tagline","heroTitle","heroSubtitle","telegram","announcement","accentColor","logoUrl","footerText","featuredTitle","trendingTitle","allCoursesTitle","categoriesTitle","seoTitle","seoDescription"];
  const payload={};keys.forEach(k=>payload[k]=$("#set-"+k).value.trim());payload.announcementEnabled=$("#set-announcementEnabled").checked;
  try{await saveSettings(payload);msg.textContent="Website settings updated.";msg.className="form-msg success";}catch(err){msg.textContent=err.message;msg.className="form-msg error";}
};


function setMediaPreview(id,src,label){
  const p=$(id);
  if(!p)return;
  p.innerHTML=src?`<img src="${src}" alt="${label} preview">`:`<span>${label}</span>`;
}

async function handleMediaUpload(fileInputId,statusId,previewId,docId,opts,label){
  const input=$(fileInputId),status=$(statusId);
  const file=input.files?.[0];
  if(!file){status.textContent="Choose an image first.";return;}
  status.textContent="Compressing and uploading…";
  try{
    const out=await compressImage(file,opts);
    await saveMedia(docId,{dataUrl:out.dataUrl,width:out.width,height:out.height,type:out.type,bytes:out.bytes});
    setMediaPreview(previewId,out.dataUrl,label);
    status.textContent=`Saved • ${out.width}×${out.height} • ${prettyBytes(out.bytes)}`;
  }catch(err){status.textContent=err.message;}
}

$("#uploadLogoBtn")?.addEventListener("click",()=>handleMediaUpload("#logoFile","#logoStatus","#logoPreview","logo",{maxWidth:600,maxHeight:240,targetBytes:110*1024},"Logo"));
$("#uploadHeroBtn")?.addEventListener("click",()=>handleMediaUpload("#heroFile","#heroStatus","#heroPreview","hero",{maxWidth:1400,maxHeight:800,targetBytes:280*1024},"Hero"));
$("#uploadFaviconBtn")?.addEventListener("click",()=>handleMediaUpload("#faviconFile","#faviconStatus","#faviconPreview","favicon",{maxWidth:192,maxHeight:192,targetBytes:55*1024},"Favicon"));

$("#clearLogoBtn")?.addEventListener("click",async()=>{await clearMedia("logo");setMediaPreview("#logoPreview","","Default logo");$("#logoStatus").textContent="Using default logo.";});
$("#clearHeroBtn")?.addEventListener("click",async()=>{await clearMedia("hero");setMediaPreview("#heroPreview","","No hero image");$("#heroStatus").textContent="Hero image removed.";});
$("#clearFaviconBtn")?.addEventListener("click",async()=>{await clearMedia("favicon");setMediaPreview("#faviconPreview","","Default icon");$("#faviconStatus").textContent="Using default icon.";});

watchMedia("logo",m=>setMediaPreview("#logoPreview",m.dataUrl||"","Default logo"),console.error);
watchMedia("hero",m=>setMediaPreview("#heroPreview",m.dataUrl||"","No hero image"),console.error);
watchMedia("favicon",m=>setMediaPreview("#faviconPreview",m.dataUrl||"","Default icon"),console.error);


watchCourses(list=>{courses=list;refreshStats();renderCourseList();renderCategories();},console.error);
watchCategories(list=>{categories=list;refreshStats();renderCategories();renderCategoryOptions($("#category")?.value||"");},console.error);
watchSettings(s=>{settings=s;fillSettings(s);},console.error);

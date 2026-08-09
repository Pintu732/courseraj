
import { $, $$ } from "../lib/dom.js";

export const DEFAULTS = {
  brandName:"Courseraj",
  tagline:"Premium skill courses. Direct Telegram access.",
  heroTitle:"Learn skills that move you forward.",
  heroSubtitle:"Discover practical courses across AI, editing, marketing, coding, spoken English, freelancing and more.",
  telegram:"https://t.me/YourTelegram",
  announcement:"New skill courses added regularly",
  announcementEnabled:true,
  accentColor:"#E50914",
  logoUrl:"assets/icons/logo.svg",
  footerText:"Skill course discovery. Direct Telegram access.",
  featuredTitle:"Featured Courses",
  trendingTitle:"Trending Now",
  allCoursesTitle:"All Courses",
  categoriesTitle:"Explore by Skill",
  seoTitle:"Courseraj — Premium Skill Courses",
  seoDescription:"Discover practical skill courses and connect on Telegram."
};

export function applySettings(s={}){
  const x={...DEFAULTS,...s};
  document.documentElement.style.setProperty("--accent",x.accentColor || DEFAULTS.accentColor);

  $$("[data-brand]").forEach(el=>el.textContent=x.brandName);
  $$("[data-logo]").forEach(el=>el.src=x.logoUrl || DEFAULTS.logoUrl);
  $$("[data-telegram]").forEach(el=>{el.href=x.telegram; el.target="_blank"; el.rel="noopener"});
  $$("[data-footer]").forEach(el=>el.textContent=x.footerText);
  $$("[data-tagline]").forEach(el=>el.textContent=x.tagline);

  const heroTitle=$("#heroTitle"); if(heroTitle) heroTitle.textContent=x.heroTitle;
  const heroSubtitle=$("#heroSubtitle"); if(heroSubtitle) heroSubtitle.textContent=x.heroSubtitle;
  const announcement=$("#announcement");
  if(announcement){
    announcement.textContent=x.announcement;
    announcement.closest(".announcement")?.classList.toggle("hidden",!x.announcementEnabled);
  }

  const f=$("#featuredTitle"); if(f) f.textContent=x.featuredTitle;
  const t=$("#trendingTitle"); if(t) t.textContent=x.trendingTitle;
  const a=$("#allCoursesTitle"); if(a) a.textContent=x.allCoursesTitle;
  const c=$("#categoriesTitle"); if(c) c.textContent=x.categoriesTitle;

  document.title=x.seoTitle || x.brandName;
  const meta=document.querySelector('meta[name="description"]');
  if(meta) meta.content=x.seoDescription || "";
}


export function applyLogoMedia(media={}){
  if(media.dataUrl){
    document.querySelectorAll("[data-logo]").forEach(el=>el.src=media.dataUrl);
  }
}

export function applyHeroMedia(media={}){
  const hero=document.querySelector(".hero");
  if(!hero) return;
  if(media.dataUrl){
    hero.style.setProperty("--hero-image",`url("${media.dataUrl}")`);
    hero.classList.add("has-hero-image");
  }else{
    hero.classList.remove("has-hero-image");
    hero.style.removeProperty("--hero-image");
  }
}

export function applyFaviconMedia(media={}){
  if(!media.dataUrl) return;
  let link=document.querySelector('link[rel="icon"]');
  if(!link){
    link=document.createElement("link");
    link.rel="icon";
    document.head.appendChild(link);
  }
  link.href=media.dataUrl;
}

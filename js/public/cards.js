
import { esc } from "../lib/dom.js";
import { money } from "../lib/format.js";

export function courseCard(c,siteTelegram){
  const title=c.title || "Untitled Course";
  const category=c.category || "Skill";
  const creator=c.creator || "Creator";
  const telegram=c.telegram || siteTelegram || "#";
  const image=c.imageData || c.image || "";
  const badge=c.badge || "";
  const price=money(c.price) || "Ask Price";
  const old=money(c.oldPrice);

  return `<article class="course-card">
    <a class="poster" href="course.html?id=${encodeURIComponent(c.id)}">
      ${image ? `<img src="${esc(image)}" alt="${esc(title)}" loading="lazy">`
              : `<div class="poster-fallback"><span>${esc(category)}</span><strong>${esc(title)}</strong></div>`}
      ${badge ? `<em>${esc(badge)}</em>` : ""}
    </a>
    <div class="card-body">
      <div class="card-meta"><span>${esc(category)}</span><span>${c.rating ? `★ ${esc(c.rating)}` : ""}</span></div>
      <h3><a href="course.html?id=${encodeURIComponent(c.id)}">${esc(title)}</a></h3>
      <p>by ${esc(creator)}</p>
      <div class="price">${old?`<del>${old}</del>`:""}<strong>${price}</strong></div>
      <a class="btn btn-primary btn-full" href="${esc(telegram)}" target="_blank" rel="noopener">Get on Telegram ↗</a>
    </div>
  </article>`;
}

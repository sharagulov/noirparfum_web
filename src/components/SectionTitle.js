import { escapeHtml } from "../lib/format.js";

export function SectionTitle({ label, title, text = "", align = "left" }) {
  return `
    <div class="section-title section-title--${align}">
      ${label ? `<p class="label-caps">${escapeHtml(label)}</p>` : ""}
      <div class="section-rule" aria-hidden="true"></div>
      <h2>${escapeHtml(title)}</h2>
      ${text ? `<p>${escapeHtml(text)}</p>` : ""}
    </div>
  `;
}

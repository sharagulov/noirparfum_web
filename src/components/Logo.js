export function Logo({ inert = false } = {}) {
  const attr = inert ? 'aria-hidden="true"' : 'aria-label="NOIR Parfum — главная"';
  return `
    <span class="logo" ${attr}>
      <span class="logo__word">NOIR</span>
      <span class="logo__line"></span>
      <span class="logo__sub">Parfum</span>
    </span>
  `;
}

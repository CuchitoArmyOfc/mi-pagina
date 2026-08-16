/**
 * Accessible mobile navigation drawer: focus trap, Escape to close,
 * body scroll lock, closes on backdrop click or link selection.
 */

// Forces this file to be treated as an ES module (not a global script),
// so its top-level declarations don't collide with other side-effect
// scripts on the page (e.g. chocobets-modal.ts also declares `backdrop`).
export {};

const toggle = document.getElementById('menu-toggle');
const panel = document.getElementById('mobile-nav');
const backdrop = document.getElementById('mobile-nav-backdrop');

if (toggle && panel && backdrop) {
  const focusableSelector =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  let lastFocused: HTMLElement | null = null;

  const getFocusable = (): HTMLElement[] =>
    Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));

  const openDrawer = (): void => {
    lastFocused = document.activeElement as HTMLElement | null;
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
    const focusable = getFocusable();
    focusable[0]?.focus();
  };

  const closeDrawer = (): void => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
    lastFocused?.focus();
  };

  const isOpen = (): boolean => !panel.hidden;

  toggle.addEventListener('click', () => {
    if (isOpen()) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  backdrop.addEventListener('click', closeDrawer);

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

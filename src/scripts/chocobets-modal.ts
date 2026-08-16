/**
 * Choco Bets entry modal: same accessible-dialog pattern as the mobile nav
 * drawer (focus trap, Escape to close, body scroll lock, backdrop click).
 */

// See mobile-nav.ts: forces module scope so top-level names don't collide.
export {};

const openBtn = document.getElementById('chocobets-open');
const modal = document.getElementById('chocobets-modal');
const backdrop = document.getElementById('chocobets-backdrop');
const closeBtn = document.getElementById('chocobets-close');

if (openBtn && modal && backdrop && closeBtn) {
  const focusableSelector =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  let lastFocused: HTMLElement | null = null;

  const getFocusable = (): HTMLElement[] =>
    Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));

  const isOpen = (): boolean => !modal.hidden;

  const open = (): void => {
    lastFocused = document.activeElement as HTMLElement | null;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    getFocusable()[0]?.focus();
  };

  const close = (): void => {
    modal.hidden = true;
    document.body.style.overflow = '';
    lastFocused?.focus();
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      close();
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

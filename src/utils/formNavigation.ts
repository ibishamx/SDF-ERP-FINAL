import React from 'react';

/**
 * Universal Form Enter Key Navigation Handler
 * Prevents premature form submission on Enter and shifts focus to the next input/select/textarea/submit button.
 */
export const handleFormKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === 'Enter') {
    const target = e.target as HTMLElement;

    // Allow Enter on buttons (such as the Save / Submit button) to activate the button
    if (target.tagName === 'BUTTON') {
      return;
    }

    // Allow Shift + Enter in textarea for multi-line notes if desired
    if (target.tagName === 'TEXTAREA' && e.shiftKey) {
      return;
    }

    // Stop premature form submission on Enter
    e.preventDefault();

    // Locate the parent form or modal container
    const form = target.closest('form') || target.closest('[data-form-container="true"]');
    if (!form) return;

    // Collect all active, focusable interactive form fields
    const focusableSelectors = [
      'input:not([type="hidden"]):not([disabled]):not([readonly]):not([tabindex="-1"])',
      'select:not([disabled]):not([readonly]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([readonly]):not([tabindex="-1"])',
      'button[type="submit"]:not([disabled])',
    ].join(', ');

    const focusableElements = Array.from(
      form.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });

    const currentIndex = focusableElements.indexOf(target);
    if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
      const nextElement = focusableElements[currentIndex + 1];
      nextElement.focus();
      if (nextElement instanceof HTMLInputElement && nextElement.type !== 'date') {
        try {
          nextElement.select?.();
        } catch {
          // ignore if select not supported
        }
      }
    } else if (currentIndex === focusableElements.length - 1) {
      // If already at the last element and it's not the submit button, find and focus submit button
      const submitBtn = form.querySelector<HTMLElement>('button[type="submit"]:not([disabled])');
      if (submitBtn && submitBtn !== target) {
        submitBtn.focus();
      }
    }
  }
};

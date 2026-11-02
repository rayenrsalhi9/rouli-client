import React, { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogProps {
  /** Rendered inside the dialog. Wire close buttons to `requestClose` so the exit animation runs. */
  children: (props: {
    titleId: string;
    descriptionId?: string;
    requestClose: () => void;
  }) => ReactNode;
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  /** Element that should receive focus when the dialog opens. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** `center` = centred modal, `sheet` = bottom sheet anchored to the viewport bottom. */
  variant?: 'center' | 'sheet';
}

/**
 * Modal dialog shell following the WAI-ARIA APG dialog pattern.
 *
 * Handles the four things every overlay in the app needs and that are easy
 * to forget: `role="dialog"` + `aria-modal`, focus trapping, Escape to
 * dismiss, and focus restoration to the trigger on close.
 */
export const Dialog: React.FC<DialogProps> = ({
  children,
  onClose,
  label,
  initialFocusRef,
  variant = 'center',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [closing, setClosing] = React.useState(false);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const reduce = useReducedMotion() ?? false;

  const requestClose = useCallback(() => {
    if (reduce) {
      onClose();
      return;
    }
    setClosing(true);
  }, [onClose, reduce]);

  const getFocusable = useCallback(
    () => {
      const panel = panelRef.current;
      if (!panel) return [] as HTMLElement[];
      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    },
    [],
  );

  // Move focus into the dialog on open, remember where to send it back.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const target = initialFocusRef?.current ?? getFocusable()[0] ?? panelRef.current;
    target?.focus();
    return () => {
      restoreFocusRef.current?.focus?.();
    };
  }, [getFocusable, initialFocusRef]);

  // Escape closes, Tab cycles inside the panel.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [getFocusable, requestClose]);

  // Lock background scroll while the dialog is open.
  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, []);

  const isSheet = variant === 'sheet';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.18 }}
      onAnimationComplete={() => {
        if (closing) onClose();
      }}
      style={closing ? { pointerEvents: 'none' } : undefined}
      className={
        isSheet
          ? 'fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs'
          : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
      }
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        initial={
          reduce
            ? false
            : { opacity: 0, y: isSheet ? 24 : 12, scale: isSheet ? 1 : 0.98 }
        }
        animate={
          closing
            ? { opacity: 0, y: isSheet ? 16 : 8, scale: isSheet ? 1 : 0.985 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={
          closing
            ? { duration: 0.16, ease: 'easeIn' }
            : { type: 'spring', visualDuration: 0.42, bounce: 0.04 }
        }
        className={
          isSheet
            ? 'bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto overscroll-contain safe-area-b'
            : 'bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-neutral-200 overscroll-contain'
        }
      >
        {children({ titleId, descriptionId, requestClose })}
      </motion.div>
    </motion.div>
  );
};

import { useEffect, useRef } from "react";

const DRAFT_KEY = "rentsmart_create_listing_draft";

// ─── Read draft (called once at init) ────────────────────────────────────────
export const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// ─── Save draft ───────────────────────────────────────────────────────────────
export const saveDraft = (form, step) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
  } catch {
    // storage full — fail silently
  }
};

// ─── Clear draft (call after successful publish) ──────────────────────────────
export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
};

// ─── Hook: auto-saves form + step whenever they change (debounced 600ms) ──────
export function useListingDraft(form, step) {
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveDraft(form, step), 600);
    return () => clearTimeout(timerRef.current);
  }, [form, step]);
}
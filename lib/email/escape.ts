// Escapes user-provided strings before injecting them into email HTML.
// Prevents HTML/script injection into email bodies.
// Applied to every dynamic string rendered in lib/email/templates/*.tsx.
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
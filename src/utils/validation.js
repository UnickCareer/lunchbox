/*
 * Name-based login validation.
 *
 * Employee names can contain:
 * - letters
 * - spaces
 * - normal punctuation such as . ' -
 */

export function normalizeName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function isValidName(name) {
  const value = String(name || "").trim();

  if (!value) {
    return false;
  }

  if (value.length < 2 || value.length > 50) {
    return false;
  }

  return /^[a-zA-Z][a-zA-Z .'-]*$/.test(value);
}
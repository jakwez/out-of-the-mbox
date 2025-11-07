export function getInitials(
  name: string,
  capitalize: boolean,
  num?: number
): Array<string> {
  // Remove punctuation and extra whitespace
  const clean = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  // Split on spaces and filter out empty parts
  let parts = clean.split(/\s+/).filter(Boolean);
  if (num !== undefined) {
    parts.length = Math.min(num, parts.length);
  }
  let initials = capitalize
    ? parts.map((part) => part[0].toUpperCase())
    : parts.map((part) => part[0]);
  return initials;
}

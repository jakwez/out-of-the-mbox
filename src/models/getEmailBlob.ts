import type { MBOXIndex } from "./MBOXIndex";

export function getEmailBlob(
  file: File,
  emailIndex: number,
  mboxIndex: MBOXIndex
): Blob {
  const startOffset = mboxIndex[emailIndex];
  const endOffset = mboxIndex[emailIndex + 1] ?? file.size;
  const blob = file.slice(startOffset, endOffset);
  return blob;
}

import type { MBOXIndex } from "./MBOXIndex";

export type OnCreateIndexProgress = (
  zeroToOneProgress: number, // position in the file normalized to 0..1
  numEmailsReadSoFar: number
) => void | Promise<void>;

const separator = new TextEncoder().encode("\nFrom "); // pattern as bytes

export async function createMBOXIndex(
  file: File,
  onProgress: OnCreateIndexProgress
): Promise<MBOXIndex> {
  const mboxIndex: MBOXIndex = [];
  // console.log("FILE SIZE", file.size);
  let matchingPosInPattern = 0; // in the separator, -1 for no match
  let matchingPosInFile = 0; //
  let position = 0;
  const reader = file.stream().getReader();

  let lineCount = 0;
  let { done, value } = await reader.read();
  while (!done) {
    for (let i = 0; i < value!.length; i++) {
      const char = value![i];
      if (char === 13) {
        // Carriage Return!
      }
      if (char === 10) {
        // Line feed
        lineCount++;
      }
      position++;
      if (char === separator[matchingPosInPattern + 1]) {
        if (matchingPosInPattern === -1) {
          matchingPosInFile = position; // first char of the pattern, remember the position
        }
        matchingPosInPattern++;
        if (matchingPosInPattern >= separator.length - 1) {
          // console.log("GOT IT AT", matchingPosInFile, numMessages);
          mboxIndex.push(matchingPosInFile);
          const ret = onProgress(
            matchingPosInFile / file.size,
            mboxIndex.length
          );
          if (ret instanceof Promise) {
            await ret;
          }
          matchingPosInPattern = -1;
          matchingPosInFile = -1;
        }
      } else if (
        matchingPosInPattern === 0 &&
        char === separator[matchingPosInPattern]
      ) {
        // Case where the first char of the pattern appears in a sequence before the
        // other chars of the pattern. This code works because the pattern doesn't
        // having sequences of the same char... All this code is pretty rough, need rework
        matchingPosInPattern = 0;
        matchingPosInFile = position;
      } else {
        matchingPosInPattern = -1;
        matchingPosInFile = -1;
      }
    }
    ({ done, value } = await reader.read());
  }

  // Indicate we're done with a last onProgress call. If there were emails,
  // the last argument will be the same as for the last onProgress call
  const ret = onProgress(1, mboxIndex.length);
  if (ret instanceof Promise) {
    await ret;
  }
  return mboxIndex;
}

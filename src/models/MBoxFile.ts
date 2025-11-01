export type OnBuildIndexProgress = (
  zeroToOneProgress: number, // position in the file normalized to 0..1
  messageIndex: number
) => void | Promise<void>;

export class MBOXFile {
  static readonly separator = new TextEncoder().encode("\nFrom "); // pattern as bytes

  static getMessageBlob(
    file: File,
    messageIndex: number,
    messageIndices: Array<number>
  ): Blob {
    const startOffset = messageIndices[messageIndex];
    const endOffset = messageIndices[messageIndex + 1] ?? file.size;
    const blob = file.slice(startOffset, endOffset);
    return blob;
  }

  static async buildIndex(
    file: File,
    onProgress: OnBuildIndexProgress
  ): Promise<Array<number>> {
    const messageIndices: Array<number> = [];
    // console.log("FILE SIZE", file.size);
    let matchingPosInPattern = 0; // in the separator, -1 for no match
    let matchingPosInFile = 0; //
    let numMessages = 0;
    let position = 0;
    const reader = file.stream().getReader();

    let lineCount = 0;
    while (true) {
      const { done, value } = await reader.read();
      //   console.log("Read done!");
      if (done) {
        const ret = onProgress(1, messageIndices.length);
        if (ret instanceof Promise) {
          await ret;
        }
        break;
      }
      for (let i = 0; i < value.length; i++) {
        const char = value[i];
        if (char === 13) {
          // Carriage Return!
        }
        if (char === 10) {
          // Line feed
          lineCount++;
        }
        position++;
        if (char === MBOXFile.separator[matchingPosInPattern + 1]) {
          if (matchingPosInPattern === -1) {
            matchingPosInFile = position; // first char of the pattern, remember the position
          }
          matchingPosInPattern++;
          if (matchingPosInPattern >= MBOXFile.separator.length - 1) {
            numMessages++;
            // console.log("GOT IT AT", matchingPosInFile, numMessages);
            const ret = onProgress(
              matchingPosInFile / file.size,
              messageIndices.length
            );
            if (ret instanceof Promise) {
              await ret;
            }
            messageIndices.push(matchingPosInFile);
            matchingPosInPattern = -1;
            matchingPosInFile = -1;
          }
        } else if (
          matchingPosInPattern === 0 &&
          char === MBOXFile.separator[matchingPosInPattern]
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
    }
    return messageIndices;
  }
}

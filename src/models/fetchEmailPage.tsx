import PostalMime from "postal-mime";
import { getEmailBlob } from "./getEmailBlob";
import type { MBOXIndex } from "./MBOXIndex";

export async function fetchEmailPage(
  mboxFile: File,
  mboxIndex: MBOXIndex,
  page: number,
  rowsPerPage: number
) {
  const parsePromises = [];
  for (let i = 0; i < rowsPerPage; i++) {
    const emailIndex = rowsPerPage * page + i;
    if (emailIndex < mboxIndex.length) {
      parsePromises.push(
        PostalMime.parse(getEmailBlob(mboxFile, emailIndex, mboxIndex))
      );
    }
  }
  const emails = await Promise.all(parsePromises);
  return emails;
}

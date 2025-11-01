import { useEffect, useState } from "react";
import { MBOXFile } from "../models/MBoxFile";
import PostalMime from "postal-mime";
import type {
  Email,
  // Address,
  // Mailbox,
  // Header,
  // Attachment,
  // PostalMimeOptions,
  // AddressParserOptions,
  // RawEmail,
} from "postal-mime";

export type ViewMBOXPageProps = {
  file: File;
  messageIndex: Array<number>;

  index: number;
};

export function MessageViewer({
  file,
  messageIndex,
  index,
}: ViewMBOXPageProps) {
  const [email, setEmail] = useState<Email | null>(null);
  useEffect(() => {
    PostalMime.parse(MBOXFile.getMessageBlob(file, index, messageIndex)).then(
      (email) => {
        setEmail(email);
      }
    );
  }, [file, messageIndex, index]);

  return (
    <div>
      <b>Email #{index}</b>
      {email ? (
        <div>
          <div>
            <b>Subject</b>: {email.subject}
          </div>
          <div>
            <b>Date:</b> {email.date}
          </div>
          <div>
            <b>Attachments</b>:
            {email.attachments.map((attachment, index) => {
              const size =
                typeof attachment.content === "string"
                  ? attachment.content.length
                  : attachment.content.byteLength;
              return (
                <span>
                  {index !== 0 && ","} {attachment.filename ?? "Unnamed"} (
                  {size} bytes)
                </span>
              );
            })}
          </div>
          <pre>{email.text}</pre>

          {/* {email.html ? (
            <div dangerouslySetInnerHTML={{ __html: email.html }}></div>
          ) : (
            <pre>{email.text}</pre>
          )} */}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

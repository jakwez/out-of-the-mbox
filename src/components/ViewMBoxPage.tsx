import { useState } from "react";
import { MessageViewer } from "./MessageViewer";

export type ViewMBOXPageProps = {
  file: File;
  messageIndex: Array<number>;
};

export function ViewMBOXPage({ file, messageIndex }: ViewMBOXPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const onRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(parseInt(event.target.value));
  };
  return (
    <div>
      <div>Hello! You've got {messageIndex.length} emails</div>
      <input
        type="range"
        min={0}
        max={messageIndex.length - 1}
        onChange={onRangeChange}
        style={{ width: "100%" }}
      />
      <MessageViewer
        file={file!}
        messageIndex={messageIndex}
        index={currentIndex}
      />
    </div>
  );
}

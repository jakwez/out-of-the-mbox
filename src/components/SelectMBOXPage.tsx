import { useState } from "react";
import { throttleOnProgress } from "../models/throttleOnProgress";
import Button from "@mui/material/Button";
import type { MBOXIndex } from "../models/MBOXIndex";
import {
  createMBOXIndex,
  type OnCreateIndexProgress,
} from "../models/createMBOXIndex";

export type SelectMBOXPageProps = {
  onIndexLoaded: (file: File, mboxIndex: MBOXIndex) => void;
};

export function SelectMBOXPage({ onIndexLoaded }: SelectMBOXPageProps) {
  const [loadingProgress, setLoadingProgress] = useState(-1);
  const [numMessages, setNumMessages] = useState(0);

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.files) {
      return;
    }
    const file = inputElement.files[0]; // this is a File (subclass of Blob)
    if (!file) {
      return;
    }

    const onProgress = throttleOnProgress<OnCreateIndexProgress>(
      (zeroToOneProgress: number, index: number) => {
        setLoadingProgress(zeroToOneProgress);
        setNumMessages(index + 1);
        return new Promise((r) => setTimeout(r, 0));
      },
      20
    );
    const idx = await createMBOXIndex(file, onProgress);
    onIndexLoaded(file, idx);
  };
  return (
    <>
      <Button variant="contained">Hello world</Button>
      <input type="file" onChange={onFileSelected} accept=".mbox" />
      <div>
        {/* <label htmlFor="progressBar">Progress</label> */}
        <progress
          id="progressBar"
          value={loadingProgress}
          max={1}
        ></progress>{" "}
        {numMessages}
      </div>
    </>
  );
}

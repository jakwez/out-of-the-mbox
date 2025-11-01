import { useState } from "react";
import { type OnBuildIndexProgress, MBOXFile } from "../models/MBoxFile";
import { createThrottledProgressCallback } from "../helpers/createThrottledProgressCallback";

export type SelectMBOXPageProps = {
  onIndexLoaded: (file: File, idx: Array<number>) => void;
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

    const onProgress = createThrottledProgressCallback<OnBuildIndexProgress>(
      (zeroToOneProgress: number, index: number) => {
        setLoadingProgress(zeroToOneProgress);
        setNumMessages(index + 1);
        return new Promise((r) => setTimeout(r, 0));
      },
      20
    );
    const idx = await MBOXFile.buildIndex(file, onProgress);
    onIndexLoaded(file, idx);
  };
  return (
    <>
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

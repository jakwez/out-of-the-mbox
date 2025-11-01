import { useState } from "react";
import "./App.css";
import { SelectMBOXPage } from "./components/SelectMBOXPage";
import { ViewMBOXPage } from "./components/ViewMBoxPage";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [mboxIndex, setMBoxIndex] = useState<Array<number>>([]);
  const onIndexLoaded = (file: File, index: Array<number>) => {
    setFile(file);
    setMBoxIndex(index);
  };

  return (
    <>
      {mboxIndex.length === 0 ? (
        <SelectMBOXPage onIndexLoaded={onIndexLoaded} />
      ) : (
        <ViewMBOXPage file={file!} messageIndex={mboxIndex} />
      )}
    </>
  );
}

export default App;

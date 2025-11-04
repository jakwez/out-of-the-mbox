import { useState } from "react";
import "./App.css";
import { SelectMBOXPage } from "./components/SelectMBOXPage";
import { ViewMBOXPage } from "./components/ViewMBoxPage";
import BasicTable from "./components/BasicTable";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import EmailIcon from "@mui/icons-material/Email";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FileOpenIcon from "@mui/icons-material/FileOpen";
function App() {
  const [file, setFile] = useState<File | null>(null);
  const [mboxIndex, setMBoxIndex] = useState<Array<number>>([]);
  const onIndexLoaded = (file: File, index: Array<number>) => {
    setFile(file);
    setMBoxIndex(index);
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          > */}
          <EmailIcon
            // size="large"
            // edge="start"
            // color="inherit"
            // aria-label="menu"
            sx={{ mr: 2 }}
          />
          {/* </IconButton> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MBOX
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <FileOpenIcon />
          </IconButton>
          {/* <Button color="inherit">Login</Button> */}
        </Toolbar>
      </AppBar>
      <BasicTable />;
    </Box>
  );
  // return

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

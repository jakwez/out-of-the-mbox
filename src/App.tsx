import { useState } from "react";
import BasicTable from "./components/BasicTable";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import EmailIcon from "@mui/icons-material/Email";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { throttleOnProgress } from "./models/throttleOnProgress";
import {
  createMBOXIndex,
  type OnCreateIndexProgress,
} from "./models/createMBOXIndex";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Backdrop,
  Button,
  LinearProgress,
  Paper,
  TablePagination,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [mboxIndex, setMBoxIndex] = useState<Array<number>>([]);
  const [progress, setProgress] = useState(-1);
  const [numEmails, setNumEmails] = useState(0);

  const onSelectMBOXClick = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        setProgress(zeroToOneProgress);
        setNumEmails(index + 1);
        return new Promise((r) => setTimeout(r, 0));
      },
      20
    );
    const mboxIndex = await createMBOXIndex(file, onProgress);
    setFile(file);
    setMBoxIndex(mboxIndex);
  };

  const [page, setPage] = useState(2);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isBusy = progress >= 0 && progress < 1;
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <EmailIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MBOX
          </Typography>
          <Button
            loading={isBusy}
            loadingPosition="start"
            component="label"
            variant="contained"
            tabIndex={-1}
            startIcon={<FileOpenIcon />}
          >
            Open
            <VisuallyHiddenInput
              type="file"
              onChange={onSelectMBOXClick}
              multiple={false}
              accept=".mbox"
            />
          </Button>
        </Toolbar>
      </AppBar>

      <Backdrop open={isBusy}>
        <Box
          sx={{
            width: "30%",
            minWidth: 300,
            // minHeight: 200,
            backgroundColor: "green",
          }}
        >
          {/* <Paper sx={{ width: "30%" }}>Some text</Paper> */}
          <DemoPaper square={true}>
            <div style={{ paddingBottom: 5 }}>{numEmails} emails</div>
            <LinearProgress
              sx={{
                "& .MuiLinearProgress-bar": {
                  transition: "none",
                },
              }}
              variant="determinate"
              value={progress * 100}
            />
          </DemoPaper>
        </Box>
      </Backdrop>

      <Box /*display="flex" flexDirection={"column"}*/>
        <Box display="flex" flexDirection={"row"} justifyContent="center">
          <TablePagination
            component="div"
            count={100}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={isSmall ? [] : [10, 50, 100, 200]}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton
            showLastButton
          />
        </Box>
        <BasicTable />
      </Box>
    </Box>
  );
  // return (
  //   <>
  //     {mboxIndex.length === 0 ? (
  //       <SelectMBOXPage onIndexLoaded={onIndexLoaded} />
  //     ) : (
  //       <ViewMBOXPage file={file!} messageIndex={mboxIndex} />
  //     )}
  //   </>
  // );
}
const DemoPaper = styled(Paper)(({ theme }) => ({
  // width: 120,
  // height: 140,
  // witdh: "30%",
  // backgroundColor: "red",
  padding: theme.spacing(2),
  paddingTop: 20,
  paddingBottom: 20,
  ...theme.typography.body2,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

export default App;

// <Box
//               sx={{ width: "30%", backgroundColor: "red" }}
//               flexDirection="column"
//             >
//               {/* <CircularProgress color="inherit" /> */}
//               <Typography variant="h5" component="div" justifyContent="center">
//                 1249 emails
//               </Typography>
//               <LinearProgress variant="determinate" value={progress} />
//             </Box>

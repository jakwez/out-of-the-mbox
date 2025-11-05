import { useState } from "react";
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
import { Fragment } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import type { Email } from "postal-mime";
import { getEmailBlob } from "./models/getEmailBlob";
import PostalMime from "postal-mime";
import type { MBOXIndex } from "./models/MBOXIndex";

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

// MBOX email index to actual Email record
// type MBOXEmails = Record<number, Email>;

async function fetchEmailPage(
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

function createListItem(email: Email, key: string) {
  const name = email.from?.name ?? "Unknown sender";
  const textPreview = email.text
    ? " - " + email.text.substring(0, 80 - name.length) + "..."
    : "";
  return (
    <div key={key}>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt={name} src="/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText
          primary={email.subject ?? "(No subject)"}
          secondary={
            <Fragment>
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.primary", display: "inline" }}
              >
                {name}
              </Typography>
              {textPreview}
            </Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </div>
  );
}

function App() {
  const [mboxFile, setMBOXFile] = useState<File | null>(null);
  // const [mboxEmailDict, setMBoxEmailDict] = useState<MBOXEmails>({});
  const [mboxEmails, setMBoxEmails] = useState<Array<Email>>([]);
  const [mboxIndex, setMBoxIndex] = useState<Array<number>>([]);
  const [progress, setProgress] = useState(-1);
  const [numEmails, setNumEmails] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

    setPage(0);
    setMBOXFile(file);
    setMBoxEmails([]);
    await new Promise((r) => setTimeout(r, 0));

    const onProgress = throttleOnProgress<OnCreateIndexProgress>(
      (zeroToOneProgress: number, numEmailsReadSoFar: number) => {
        setProgress(zeroToOneProgress);
        setNumEmails(numEmailsReadSoFar);
        return new Promise((r) => setTimeout(r, 0));
      },
      20
    );
    const index = await createMBOXIndex(file, onProgress);
    setMBoxIndex(index);
    await new Promise((r) => setTimeout(r, 0));

    const emails = await fetchEmailPage(file, index, 0, rowsPerPage);
    setMBoxEmails(emails);
  };

  const handleChangePage = async (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    const emails = await fetchEmailPage(
      mboxFile!,
      mboxIndex,
      newPage,
      rowsPerPage
    );
    setMBoxEmails(emails);
    setPage(newPage);
  };
  const handleChangeRowsPerPage = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    const emails = await fetchEmailPage(mboxFile!, mboxIndex, 0, rowsPerPage);
    setMBoxEmails(emails);
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

      {mboxIndex.length !== 0 && (
        <Box /*display="flex" flexDirection={"column"}*/>
          <Box display="flex" flexDirection={"row"} justifyContent="center">
            <TablePagination
              component="div"
              count={mboxIndex.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPageOptions={isSmall ? [] : [10, 50, 100, 200]}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              showFirstButton
              showLastButton
            />
          </Box>
          <List
            sx={{
              width: "100%",
              /*maxWidth: 360,*/ bgcolor: "background.paper",
            }}
          >
            {/* {Object.keys(mboxEmailDict).map((index) => {
            const email = mboxEmailDict[parseInt(index)];
            return createListItem(email);
          })} */}
            {mboxEmails.map((email, index) =>
              createListItem(email, index.toString())
            )}
          </List>

          {/* <AlignItemsList /> */}
          {/* <BasicTable /> */}
        </Box>
      )}
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

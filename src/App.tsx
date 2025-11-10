import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import EmailIcon from "@mui/icons-material/Email";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { throttleOnProgress } from "./util/throttleOnProgress";
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
import List from "@mui/material/List";
import type { Email } from "postal-mime";
import { EmailDialog } from "./components/EmailDialog";
import { EmailListItem } from "./components/EmailListItem";
import { fetchEmailPage } from "./models/fetchEmailPage";
import { SettingsContext } from "./Settings";
import type { Settings } from "./Settings";

export function App() {
  const [settings, setSettings] = useState<Settings>({
    contentViewMode: "safe_html",
  });

  const [mboxFile, setMBOXFile] = useState<File | null>(null);
  const [mboxIndex, setMBoxIndex] = useState<Array<number>>([]);

  const [progress, setProgress] = useState(-1);
  const [numEmailsProgress, setNumEmailsProgress] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [emailsOnPage, setEmailsOnPage] = useState<Array<Email>>([]);
  const [emailIndexOnPageViewed, setEmailIndexOnPageViewed] = useState(-1);

  const openMboxFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setMBoxIndex([]);
    setEmailsOnPage([]);
    await new Promise((r) => setTimeout(r, 0));

    const onProgress = throttleOnProgress<OnCreateIndexProgress>(
      (zeroToOneProgress: number, numEmailsReadSoFar: number) => {
        setProgress(zeroToOneProgress);
        setNumEmailsProgress(numEmailsReadSoFar);
        return new Promise((r) => setTimeout(r, 0));
      },
      20
    );
    const index = await createMBOXIndex(file, onProgress);
    setMBoxIndex(index);
    await new Promise((r) => setTimeout(r, 0));

    const emails = await fetchEmailPage(file, index, 0, rowsPerPage);
    setEmailsOnPage(emails);
  };

  // Doesn't affect emailIndexOnPageViewed
  const fetchEmailsOnPage = async (p: number, rpp: number) => {
    const emails = await fetchEmailPage(mboxFile!, mboxIndex, p, rpp);
    setEmailsOnPage(emails);
    if (p !== page) {
      setPage(p);
    }
    if (rpp !== rowsPerPage) {
      setRowsPerPage(rpp);
    }
  };

  const handleChangePage = async (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    await fetchEmailsOnPage(newPage, rowsPerPage);
    setEmailIndexOnPageViewed(-1);
  };

  const handleChangeRowsPerPage = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value);
    await fetchEmailsOnPage(page, newRowsPerPage);
    setEmailIndexOnPageViewed(-1);
  };

  const onEmailItemClick = (id: number) => {
    setEmailIndexOnPageViewed(id);
  };

  const onEmailDialogClose = () => {
    setEmailIndexOnPageViewed(-1);
  };

  // index here is not on-page, but global in mboxIndex
  const navigateToIndex = async (index: number, openDialog: boolean) => {
    if (index < 0 || index >= mboxIndex.length) {
      return;
    }
    const newPage = Math.floor(index / rowsPerPage);
    if (newPage !== page) {
      await fetchEmailsOnPage(newPage, rowsPerPage);
    }
    if (openDialog) {
      const newEmailIndexOnPageView = index % rowsPerPage;
      setEmailIndexOnPageViewed(newEmailIndexOnPageView);
    } else {
      setEmailIndexOnPageViewed(-1);
    }
  };

  const onPrevEmail = async () => {
    const newEmailIndex = page * rowsPerPage + emailIndexOnPageViewed - 1;
    await navigateToIndex(newEmailIndex, true);
  };

  const onNextEmail = async () => {
    const newEmailIndex = page * rowsPerPage + emailIndexOnPageViewed + 1;
    await navigateToIndex(newEmailIndex, true);
  };

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isBusy = progress >= 0 && progress < 1;
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
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
                onChange={openMboxFile}
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
              <div style={{ paddingBottom: 5 }}>{numEmailsProgress} emails</div>
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
          <Box>
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
              {emailsOnPage.map((email, index) => (
                <EmailListItem
                  key={index.toString()}
                  email={email}
                  emailIndex={index}
                  onEmailClick={onEmailItemClick}
                />
              ))}
            </List>
          </Box>
        )}

        {emailIndexOnPageViewed !== -1 && (
          <EmailDialog
            email={emailsOnPage[emailIndexOnPageViewed]}
            open={true}
            onClose={onEmailDialogClose}
            onPrevEmail={onPrevEmail}
            onNextEmail={onNextEmail}
          />
        )}
      </Box>
    </SettingsContext.Provider>
  );
}

const DemoPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: 20,
  paddingBottom: 20,
  ...theme.typography.body2,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

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

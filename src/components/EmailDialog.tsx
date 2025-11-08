import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type DialogProps,
} from "@mui/material";
import RawOnSharpIcon from "@mui/icons-material/RawOnSharp";
import HtmlSharpIcon from "@mui/icons-material/HtmlSharp";
import JavascriptSharpIcon from "@mui/icons-material/JavascriptSharp";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import DOMPurify from "dompurify";
import type { Email } from "postal-mime";
import { useContext } from "react";
import { SettingsContext, type ContentViewMode } from "../Settings";
import { InitialsAvatar } from "./InitialsAvatar";

export type EmailDialogProps = DialogProps & {
  email: Email;
  open: boolean;
  onClose: () => void;
  onPrevEmail: () => void;
  onNextEmail: () => void;
};

export function EmailDialog({
  email,
  open,
  onClose,
  onPrevEmail,
  onNextEmail,
}: EmailDialogProps) {
  const settingsContext = useContext(SettingsContext);
  if (!settingsContext) {
    throw new Error(`no settings context provided`);
  }
  const handleContentViewModeChange = (
    _event: React.MouseEvent,
    value: ContentViewMode
  ) => {
    if (value !== null) {
      settingsContext.setSettings({
        ...settingsContext.settings,
        contentViewMode: value,
      });
    }
  };
  const contentViewMode = settingsContext.settings.contentViewMode;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={true}
      maxWidth={"lg"}
      sx={{
        "& .MuiDialog-paper": {
          height: "80vh",
          maxHeight: "none",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" flexGrow="1">
            {email.subject!}
          </Typography>
          <ToggleButtonGroup
            value={contentViewMode}
            exclusive
            onChange={handleContentViewModeChange}
            aria-label="text alignment"
          >
            <ToggleButton value={"raw_text" satisfies ContentViewMode}>
              <RawOnSharpIcon />
            </ToggleButton>
            <ToggleButton value={"safe_html" satisfies ContentViewMode}>
              <HtmlSharpIcon />
            </ToggleButton>
            <ToggleButton value={"full_html" satisfies ContentViewMode}>
              <JavascriptSharpIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ width: 16 }} />

          <IconButton onClick={() => onPrevEmail()}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={() => onNextEmail()}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          minHeight: 300,
          // backgroundColor: "green",
          display: "flex",
          flexDirection: "column",
          // alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        {renderEmailHeaders(email)}
        {renderEmailContent(email, contentViewMode)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function renderEmailHeaders(email: Email) {
  const fromName = email.from?.name ?? "<no name>";
  const fromAddress = email.from?.address ?? "<no address>";
  const toAddresses = email.to ?? [];

  return (
    <Box bgcolor={"pink"}>
      <InitialsAvatar name={email.from?.name} />
      <Typography>
        fromName: {fromName} fromAddress:{fromAddress}
      </Typography>
      {toAddresses.map((toAddress, index) => (
        <Typography>
          toName:{toAddress.name} toAddress:{toAddress.address}
        </Typography>
      ))}
    </Box>
  );
}

function renderEmailContent(email: Email, contentViewMode: ContentViewMode) {
  switch (contentViewMode) {
    case "raw_text": {
      if (!email.text) {
        return renderCenteredMessage("No text content");
      }
      return (
        <DialogContentText whiteSpace={"pre-line"}>
          {email.text}
        </DialogContentText>
      );
    }
    case "safe_html":
    case "full_html":
      if (!email.html) {
        return renderCenteredMessage("No HTML content");
      }
      const html =
        contentViewMode === "safe_html" ? sanitizeHtml(email.html) : email.html;
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }
}

// Relies on parent being flex container
function renderCenteredMessage(message: string) {
  return (
    <Box
      flexGrow={1}
      // bgcolor={"pink"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
    >
      <Typography
        align="center"
        variant="h6"
        color="textSecondary"
        bgcolor={"white"}
      >
        {message}
      </Typography>
    </Box>
  );
}

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["iframe", "script", "link", "object", "embed"],
    FORBID_ATTR: ["srcset", "xlink:href", "formaction"],
    ALLOWED_URI_REGEXP: /^data:/, // only allow inline data URIs
  });
}

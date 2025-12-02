import {
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
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
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
// import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

import DOMPurify from "dompurify";
import type { Address, Attachment, Email } from "postal-mime";
import { useContext } from "react";
import { SettingsContext, type ContentViewMode } from "../Settings";
import { InitialsAvatar } from "./InitialsAvatar";
import { getNiceDateString } from "../models/getNiceDateString";

import JSZip from "jszip";
import { getFileExtensionFromMimeType } from "../models/getFileExtensionFromMimeType";

export type EmailDialogProps = DialogProps & {
  email: Email;
  open: boolean;
  onClose: () => void;
  onPrevEmail: () => void;
  onNextEmail: () => void;
  onGoToEmail: (index: number) => void;
};

export function EmailDialog({
  email,
  open,
  onClose,
  onPrevEmail,
  onNextEmail,
  onGoToEmail,
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

  const onDownloadAttachmentsClick = async () => {
    await downloadAttachmentsAsZip(email.attachments, "attachments.zip");
  };

  const contentViewMode = settingsContext.settings.contentViewMode;
  const numAttachments = email.attachments.length;
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
          <Typography
            variant="h6"
            flexGrow="1"
            overflow={"hidden"}
            whiteSpace={"nowrap"}
            textOverflow={"ellipsis"}
          >
            {email.subject!}
          </Typography>
          <ToggleButtonGroup
            value={contentViewMode}
            exclusive
            onChange={handleContentViewModeChange}
            aria-label="text alignment"
          >
            <Badge
              color="success"
              variant="dot"
              overlap="circular"
              invisible={!email.text}
            >
              <ToggleButton value={"raw_text" satisfies ContentViewMode}>
                <RawOnSharpIcon />
              </ToggleButton>
            </Badge>

            <Badge
              color="success"
              variant="dot"
              overlap="circular"
              invisible={!email.html}
            >
              <ToggleButton value={"safe_html" satisfies ContentViewMode}>
                <HtmlSharpIcon />
              </ToggleButton>
            </Badge>

            <Badge
              color="success"
              variant="dot"
              overlap="circular"
              invisible={!email.html}
            >
              <ToggleButton value={"full_html" satisfies ContentViewMode}>
                <JavascriptSharpIcon />
              </ToggleButton>
            </Badge>
          </ToggleButtonGroup>

          <Box sx={{ width: 16 }} />

          <IconButton onClick={() => onPrevEmail()}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={() => onNextEmail()}>
            <NavigateNextIcon />
          </IconButton>
          <IconButton onClick={() => onGoToEmail(407)}>
            <MoreHorizIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {renderEmailHeaders(email)}
        <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
        {numAttachments > 0 && (
          <>
            <Typography sx={{ fontWeight: "bold" }}>
              {numAttachments} attachment{numAttachments > 1 ? "s" : ""}
              {" • "}
              <IconButton onClick={onDownloadAttachmentsClick}>
                <FileDownloadOutlinedIcon sx={{ verticalAlign: "middle" }} />
              </IconButton>
            </Typography>
            {renderEmailAttachments(email.attachments)}
            <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          </>
        )}
        {renderEmailContent(email, contentViewMode)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// function renderNameAndAddress(n: string, a: string, boldName: boolean) {
//   return (
//     <>
//       <Typography sx={boldName ? { fontWeight: "bold" } : {}}>{n}</Typography>
//       <Typography>{`<${a}>`}</Typography>
//     </>
//   );
// }

// function renderNoNameAndAddress(a: string, bold: boolean) {
//   return <Typography sx={bold ? { fontWeight: "bold" } : {}}>{a}</Typography>;
// }

function renderAddressObject(address: Address | undefined, bold: boolean) {
  let n = !address || address.name === "" ? "no-name" : address.name;
  const a =
    !address || !address.address || address.address === ""
      ? "no-address"
      : address.address;
  return (
    <>
      <Typography sx={bold ? { fontWeight: "bold" } : {}}>{n}</Typography>
      <Typography variant="subtitle2">{`<${a}>`}</Typography>
    </>
  );
}

function renderEmailHeaders(email: Email) {
  const toAddresses = email.to ?? [];
  const date = getNiceDateString(email.date, false);
  return (
    <Box display="flex" flexDirection={"row"} gap={1}>
      <InitialsAvatar name={email.from?.name} />
      <Box
        // bgcolor={"grey"}
        display="flex"
        flexDirection={"column"}
        justifyContent={"center"}
        flexGrow={1}
      >
        <Box
          display="flex"
          // bgcolor={"pink"}
          flexDirection={"row"}
          gap={1}
          alignItems={"center"}
        >
          {renderAddressObject(email.from, true)}
          <Box flexGrow={1} />
          <Typography>{date}</Typography>
        </Box>
        {toAddresses.map((a, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection={"row"}
            gap={1}
            alignItems={"center"}
          >
            {renderAddressObject(a, false)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function renderEmailAttachments(attachments: Attachment[]) {
  const w = 150;
  const h = 100;
  return (
    <Box display="flex" flexDirection={"row"} gap={1} bgcolor={""}>
      {attachments.map((attachment, index) => (
        <Card sx={{ width: w, height: h }}>
          <CardActionArea
            onClick={() => {
              const filename = createFilenameForAttachment(attachment, index);
              downloadContent(
                attachment.content,
                filename,
                attachment.mimeType
              );
            }}
            // data-active={selectedCard === index ? "" : undefined}
            sx={{
              height: h,
              "&:hover": {
                backgroundColor: "action.hover", // uses MUI theme value
                cursor: "pointer",
              },
            }}
          >
            {/* <CardMedia
              component="img"
              alt="green iguana"
              height="140"
              image={attachment.content}
            /> */}
            <CardContent sx={{ height: h }}>
              <Typography variant="body2">
                {getFileExtensionFromMimeType(attachment.mimeType)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {attachment.filename ??
                  `unnamed.${getFileExtensionFromMimeType(
                    attachment.mimeType
                  )}`}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
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

function downloadContent(
  content: ArrayBuffer | string | Blob,
  filename: string,
  mimeType: string //= "application/octet-stream"
) {
  let blob: Blob;
  if (content instanceof Blob) {
    blob = content;
  } else {
    blob = new Blob([content], { type: mimeType });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadAttachmentsAsZip(
  attachments: Attachment[],
  zipName: string
) {
  const zip = new JSZip();
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    const filename = createFilenameForAttachment(attachment, i);
    zip.file(filename, attachment.content);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadContent(zipBlob, zipName, "application/zip");
}

function createFilenameForAttachment(attachment: Attachment, index: number) {
  const filename =
    attachment.filename ??
    `unnamed_${index}` +
      "." +
      getFileExtensionFromMimeType(attachment.mimeType);
  return filename;
}

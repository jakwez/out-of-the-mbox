import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import RawOnSharpIcon from "@mui/icons-material/RawOnSharp";
import HtmlSharpIcon from "@mui/icons-material/HtmlSharp";
import JavascriptSharpIcon from "@mui/icons-material/JavascriptSharp";

import DOMPurify from "dompurify";
import type { Email } from "postal-mime";
import { useState } from "react";
export interface EmailDialogProps {
  email: Email;
  open: boolean;
  onClose: () => void;
}

type ContentViewMode = "raw_text" | "safe_html" | "full_html";

export function EmailDialog(props: EmailDialogProps) {
  const [contentViewMode, setContentViewMode] =
    useState<ContentViewMode>("safe_html");

  const handleContentViewModeChange = (
    event: React.MouseEvent,
    value: ContentViewMode
  ) => {
    if (value !== null) {
      setContentViewMode(value);
    }
  };
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      maxWidth={"lg"}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{props.email.subject!}</Typography>
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
        </Box>
      </DialogTitle>
      <DialogContent sx={{ minHeight: 300 }}>
        {contentViewMode === "raw_text" && (
          <DialogContentText variant="caption">
            {props.email.text}
          </DialogContentText>
        )}
        {contentViewMode === "safe_html" && (
          <div
            dangerouslySetInnerHTML={{
              __html: props.email.html
                ? sanitizeHtml(props.email.html)
                : "No HTML content",
            }}
          />
        )}
        {contentViewMode === "full_html" && (
          <div
            dangerouslySetInnerHTML={{
              __html: props.email.html ?? "No HTML content",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["iframe", "script", "link", "object", "embed"],
    FORBID_ATTR: ["srcset", "xlink:href", "formaction"],
    ALLOWED_URI_REGEXP: /^data:/, // only allow inline data URIs
  });
}

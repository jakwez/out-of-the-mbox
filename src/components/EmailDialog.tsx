import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import type { Email } from "postal-mime";
import { useState } from "react";
export interface EmailDialogProps {
  email: Email;
  open: boolean;
  onClose: () => void;
}

export function EmailDialog(props: EmailDialogProps) {
  const [viewHtml, setViewHtml] = useState(true);
  const [purifyHtml, setPurifyHtml] = useState(true);
  let html = purifyHtml
    ? DOMPurify.sanitize(props.email.html!, {
        FORBID_TAGS: ["iframe", "script", "link", "object", "embed"],
        FORBID_ATTR: ["srcset", "xlink:href", "formaction"],
        ALLOWED_URI_REGEXP: /^data:/, // only allow inline data URIs
      })
    : props.email.html!;
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
          <FormGroup sx={{ flexDirection: "row" }}>
            <FormControlLabel
              control={
                <Switch
                  size={"small"}
                  checked={viewHtml}
                  onChange={(event) => setViewHtml(event.target.checked)}
                />
              }
              label="View HTML"
            />
            <FormControlLabel
              control={
                <Switch
                  size={"small"}
                  checked={purifyHtml}
                  onChange={(event) => setPurifyHtml(event.target.checked)}
                />
              }
              label="Clean HTML"
            />
          </FormGroup>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ minHeight: 300 }}>
        {viewHtml ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <DialogContentText variant="caption">
            {props.email.text!}
          </DialogContentText>
        )}
      </DialogContent>
    </Dialog>
  );
}

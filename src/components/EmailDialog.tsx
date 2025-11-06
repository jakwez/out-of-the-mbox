import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import type { Email } from "postal-mime";
export interface EmailDialogProps {
  email: Email;
  open: boolean;
  onClose: () => void;
}

export function EmailDialog(props: EmailDialogProps) {
  const viewHtml = false;
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      maxWidth={"lg"}
    >
      <DialogTitle>{props.email.subject!}</DialogTitle>
      <DialogContent>
        {viewHtml ? (
          <div dangerouslySetInnerHTML={{ __html: props.email.html! }} />
        ) : (
          <DialogContentText variant="caption">
            {props.email.text!}
          </DialogContentText>
        )}
      </DialogContent>
    </Dialog>
  );
}

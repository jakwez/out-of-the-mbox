import {
  Badge,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import type { Email } from "postal-mime";
import { Fragment } from "react/jsx-runtime";
import { InitialsAvatar } from "./InitialsAvatar";
import { getNiceDateString } from "../models/getNiceDateString";
import AttachmentOutlinedIcon from "@mui/icons-material/AttachmentOutlined";

export interface EmailListItemProps {
  email: Email;
  emailIndex: number;
  onEmailClick: (emailIndex: number) => void;
}

export function EmailListItem({
  email,
  emailIndex: id,
  onEmailClick: onClick,
}: EmailListItemProps) {
  const name = email.from?.name ?? "no-sender";
  const textPreview = email.text
    ? " - " + email.text.substring(0, 80 - name.length) + "..."
    : "";

  const numAttachments = email.attachments.length;
  const date = getNiceDateString(email.date, true);
  return (
    <Fragment key={id.toString()}>
      <ListItem
        alignItems="flex-start"
        onClick={(_event) => onClick(id)}
        sx={{
          transition: "background-color 0.2s",
          "&:hover": {
            backgroundColor: "action.hover", // uses MUI theme value
            cursor: "pointer",
          },
        }}
      >
        <ListItemAvatar>
          <InitialsAvatar name={email.from?.name} />
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
        <ListItemText
          secondary={
            <>
              {numAttachments > 0 && (
                <Badge
                  invisible={numAttachments == 1}
                  badgeContent={numAttachments}
                  max={9}
                  color="primary"
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                >
                  <AttachmentOutlinedIcon
                    sx={{ verticalAlign: "middle", marginRight: 1 }}
                  />
                </Badge>
              )}
              {date}
            </>
          }
          sx={{
            // bgcolor: "green",
            textAlign: "right",
          }}
        ></ListItemText>
      </ListItem>
      <Divider variant="inset" component="li" />
    </Fragment>
  );
}

import {
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import type { Email } from "postal-mime";
import { Fragment } from "react/jsx-runtime";
import { InitialsAvatar } from "./InitialsAvatar";

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
  const name = email.from?.name ?? "Unknown sender";
  const textPreview = email.text
    ? " - " + email.text.substring(0, 80 - name.length) + "..."
    : "";
  const date = new Date(email.date!).toLocaleDateString(undefined, dateOptions);

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
          secondary={date}
          sx={{
            textAlign: "right",
          }}
        ></ListItemText>
      </ListItem>
      <Divider variant="inset" component="li" />
    </Fragment>
  );
}

const dateOptions: Intl.DateTimeFormatOptions = {
  // weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric",
};

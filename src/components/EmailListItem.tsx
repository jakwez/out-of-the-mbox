import {
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import type { Email } from "postal-mime";
import { Fragment } from "react/jsx-runtime";

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
        onClick={(event) => onClick(id)}
        sx={{
          transition: "background-color 0.2s",
          "&:hover": {
            backgroundColor: "action.hover", // uses MUI theme value
            cursor: "pointer",
          },
        }}
      >
        <ListItemAvatar>
          <Avatar {...stringAvatar(name)} />
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

// From MUI documentation https://mui.com/material-ui/react-avatar/
function stringToColor(string: string) {
  let hash = 0;
  let i;
  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */
  return color;
}

function getInitials(name: string): string {
  // Remove punctuation and extra whitespace
  const clean = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  // Split on spaces and filter out empty parts
  const parts = clean.split(/\s+/).filter(Boolean);
  // Take first character of each part and capitalize
  return parts.map((p) => p[0].toUpperCase()).join("");
}

function stringAvatar(name: string) {
  const allInitials = getInitials(name);
  let twoInitials: string;
  if (allInitials.length >= 2) {
    twoInitials = allInitials[0] + allInitials[1];
  } else if (allInitials.length == 1) {
    twoInitials = allInitials[0];
  } else {
    twoInitials = "?";
  }
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: twoInitials,
  };
}

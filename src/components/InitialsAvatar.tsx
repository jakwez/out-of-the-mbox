import { Avatar } from "@mui/material";
import { stringToColor } from "../util/stringToColor";
import { getInitials } from "../util/getInitials";

export type InitialsAvatarProps = {
  name: string | undefined;
};

export function InitialsAvatar({ name }: InitialsAvatarProps) {
  if (!name) {
    return <Avatar />;
  }
  const initials = getInitials(name, true, 2);
  return (
    <Avatar
      sx={{
        bgcolor: stringToColor(name),
      }}
    >
      {initials}
    </Avatar>
  );
}

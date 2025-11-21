export function getNiceDateString(
  dateStr: string | undefined,
  useShortForm: boolean
): string {
  const str = dateStr
    ? new Date(dateStr).toLocaleDateString(
        undefined,
        useShortForm ? shortOptions : options
      )
    : "no-date";
  return str;
}

const options: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
};

const shortOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

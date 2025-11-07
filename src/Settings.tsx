import { createContext } from "react";

export type ContentViewMode = "raw_text" | "safe_html" | "full_html";

export interface Settings {
  contentViewMode: ContentViewMode;
}

export type SettingsContextType = {
  settings: Settings;
  setSettings: (settings: Settings) => void;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

function readPreference(name, allowedValues, fallback) {
  if (typeof document === "undefined") {
    return fallback;
  }

  const preferenceCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  const value = preferenceCookie?.split("=")[1];

  return allowedValues.includes(value) ? value : fallback;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  const [layoutPreference, setLayoutPreferenceState] =
    useState("comfortable");

  useEffect(() => {
    const preferenceTimer = window.setTimeout(() => {
      setThemeState(
        readPreference("theme", ["light", "dark"], "light")
      );
      setLayoutPreferenceState(
        readPreference(
          "layoutPreference",
          ["comfortable", "compact"],
          "comfortable"
        )
      );
    }, 0);

    return () => window.clearTimeout(preferenceTimer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.layout =
      layoutPreference;
  }, [layoutPreference]);

  function setTheme(newTheme) {
    setThemeState(newTheme);

    document.cookie =
      `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
  }

  function setLayoutPreference(newLayout) {
    setLayoutPreferenceState(newLayout);

    document.cookie =
      `layoutPreference=${newLayout}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        layoutPreference,
        setLayoutPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  const [layoutPreference, setLayoutPreferenceState] =
    useState("comfortable");

  useEffect(() => {
    const cookies = document.cookie
      .split("; ")
      .filter(Boolean);

    const themeCookie = cookies.find((cookie) =>
      cookie.startsWith("theme=")
    );

    const layoutCookie = cookies.find((cookie) =>
      cookie.startsWith("layoutPreference=")
    );

    if (themeCookie) {
      const savedTheme =
        themeCookie.split("=")[1];

      if (
        savedTheme === "light" ||
        savedTheme === "dark"
      ) {
        setThemeState(savedTheme);
      }
    }

    if (layoutCookie) {
      const savedLayout =
        layoutCookie.split("=")[1];

      if (
        savedLayout === "comfortable" ||
        savedLayout === "compact"
      ) {
        setLayoutPreferenceState(
          savedLayout
        );
      }
    }
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
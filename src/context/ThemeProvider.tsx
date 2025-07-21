import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("xmtp-theme") as Theme;
    if (savedTheme && ["light", "dark", "auto"].includes(savedTheme)) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "auto";
    }

    return "light";
  });

  const [isDark, setIsDark] = useState(false);

  // Determine if dark mode should be active
  useEffect(() => {
    const updateDarkMode = () => {
      let shouldBeDark = false;

      if (theme === "dark") {
        shouldBeDark = true;
      } else if (theme === "auto") {
        shouldBeDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
      }

      setIsDark(shouldBeDark);

      // Update body class
      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
      }
    };

    updateDarkMode();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "auto") {
        updateDarkMode();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem("xmtp-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "auto";
      return "light";
    });
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

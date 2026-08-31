import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import * as s from "../../styles/layout.styles";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={s.themeToggleButton}
    >
      {isDark ? (
        <Sun className={s.themeIcon} />
      ) : (
        <Moon className={s.themeIcon} />
      )}
    </button>
  );
}


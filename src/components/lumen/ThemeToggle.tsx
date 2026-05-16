import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "./icons";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="تبديل المظهر"
      className="tap relative h-10 w-[68px] rounded-full glass overflow-hidden ease-soft"
    >
      <span
        className="absolute top-1 h-8 w-8 rounded-full bg-gradient-gold shadow-glow ease-soft transition-all duration-500"
        style={{ right: isDark ? 4 : 32 }}
      />
      <span className="absolute inset-0 flex items-center justify-between px-2.5 text-muted-ink">
        <Moon className="h-4 w-4" style={{ opacity: isDark ? 0 : 0.6 }} />
        <Sun className="h-4 w-4" style={{ opacity: isDark ? 0.6 : 0 }} />
      </span>
    </button>
  );
};

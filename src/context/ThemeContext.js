import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");

    // APPLY THEME
    const applyTheme = (mode) => {
        const html = document.documentElement;

        html.classList.remove("light", "dark");

        if (mode === "dark") {
            html.classList.add("dark");
        } else if (mode === "light") {
            html.classList.add("light");
        }
    };

    // SET THEME MODE
    const setThemeMode = (mode) => {
        let finalTheme = mode;

        if (mode === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            finalTheme = prefersDark ? "dark" : "light";
        }

        setTheme(mode);
        applyTheme(finalTheme);
        localStorage.setItem("theme", mode);
    };

    // LOAD SAVED THEME
    useEffect(() => {
        const saved = localStorage.getItem("theme") || "light";

        setTheme(saved);

        if (saved === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            applyTheme(prefersDark ? "dark" : "light");
        } else {
            applyTheme(saved);
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
    const { theme, setThemeMode } = useTheme();
    return (
        <div className="theme-toggle-body">
            <div className="theme-toggle">
                <div className={`toggle-indicator ${theme}`}></div>
                <button onClick={() => setThemeMode("light")}> <FiSun /> </button>
                <button onClick={() => setThemeMode("dark")}> <FiMoon /> </button>
                <button onClick={() => setThemeMode("system")}> <FiMonitor /> </button>
            </div>
        </div>
    );
}

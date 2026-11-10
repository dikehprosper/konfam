import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
} from "react";

const ToastContext = createContext(() => {});

export function useToast() {
    return useContext(ToastContext);
}


export function ToastProvider({ children }) {
    const [toast, setToast] = useState({
        show: false,
        message: "",
    });
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef(null);

    const showToast = useCallback((message) => {
        setToast({ show: true, message });
        setVisible(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    const handleClose = () => {
        setToast((prev) => ({ ...prev, show: false }));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleTransitionEnd = () => {
        if (!toast.show) {
            setVisible(false);
            setToast({ show: false, message: "" });
        }
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {visible && (
                <div
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[99999] transition-all duration-300
      ${toast.show
                            ? "opacity-100 pointer-events-auto translate-y-0"
                            : "opacity-0 pointer-events-none -translate-y-8"
                        }`}
                    style={{ minWidth: 220, maxWidth: 400 }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    <div className='relative gap-3 dark:bg-white dark:text-black bg-black text-white px-6 py-3 rounded-lg shadow-lg text-center text-sm font-semibold flex items-center justify-center'>
                        <span className='flex-1'>{toast.message}</span>
                        <button
                            onClick={handleClose}
                            className='text-[900] cursor-pointer text-white dark:text-black opacity-70 hover:opacity-50 transition'
                            aria-label='Close'
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

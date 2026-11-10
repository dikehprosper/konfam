import React, { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

const ModalContext = createContext(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};



export const ModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [customClass, setCustomClass] = useState("");
    const location = useLocation();

    const openModal = (content, className) => {
        setModalContent(content);
        setCustomClass(className || "");
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setModalContent(null);
        setCustomClass("");
    };

    // Auto-close modal when route changes
    useEffect(() => {
        if (isOpen) closeModal();
        // eslint-disable-next-line
    }, [location.pathname]);

    const modalPortal = isOpen
        ? createPortal(
            <div
                className={"fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-auto py-4 px-1 bg-[#390067]/40 backdrop-blur-sm"}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
                onClick={closeModal}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`flex w-full max-w-[97%] max-h-[90vh] justify-center overflow-auto bg-white dark:bg-black rounded-xl shadow-2xl sm:rounded-2xl sm:max-w-[640px] ${customClass}`}
                >
                    {modalContent}
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <ModalContext.Provider value={{ openModal, closeModal, isOpen }}>
            {children}
            {modalPortal}
        </ModalContext.Provider>
    );
};

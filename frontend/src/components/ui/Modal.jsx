import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./Button";

const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
};

function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md"
}) {
    const [portalNode] = useState(() => {
        if (typeof document === "undefined") return null;
        return document.createElement("div");
    });
    const panelRef = useRef(null);
    const titleId = useId();
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!portalNode) return undefined;

        document.body.appendChild(portalNode);

        return () => portalNode.remove();
    }, [portalNode]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const previouslyFocused = document.activeElement;

        document.body.style.overflow = "hidden";

        const focusTimer = window.setTimeout(() => {
            const target = panelRef.current?.querySelector("[data-modal-autofocus]")
                || panelRef.current;
            target?.focus();
        }, 0);

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onCloseRef.current();
                return;
            }

            if (event.key !== "Tab" || !panelRef.current) return;

            const focusableElements = panelRef.current.querySelectorAll(
                "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
            );

            if (focusableElements.length === 0) {
                event.preventDefault();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.clearTimeout(focusTimer);
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [isOpen]);

    if (!isOpen || !portalNode) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-[#102b20]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-[0_32px_90px_-28px_rgba(16,43,32,0.55)] outline-none sm:rounded-3xl ${sizes[size] || sizes.md}`}
            >
                <header className="flex items-start justify-between gap-4 border-b border-[#edf0e8] px-5 py-5 sm:px-7">
                    <div>
                        <h2 id={titleId} className="text-xl font-extrabold tracking-tight text-[#1d3b2e]">{title}</h2>
                        {description && <p className="mt-1.5 text-sm leading-6 text-[#7a8b7e]">{description}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="-mr-2 !px-2" aria-label="ปิดหน้าต่าง"><X size={19} /></Button>
                </header>
                <div className="px-5 py-5 sm:px-7 sm:py-6">{children}</div>
                {footer && <footer className="flex flex-col-reverse gap-3 border-t border-[#edf0e8] bg-[#fbfcf8] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">{footer}</footer>}
            </section>
        </div>,
        portalNode
    );
}

export default Modal;
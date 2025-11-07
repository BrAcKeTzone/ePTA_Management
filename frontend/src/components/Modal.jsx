import React, { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-full h-full md:w-96 md:h-auto md:max-h-[90vh]",
    md: "w-full h-full md:w-1/2 md:max-w-2xl md:h-auto md:max-h-[90vh]",
    lg: "w-full h-full md:w-2/3 md:max-w-4xl md:h-auto md:max-h-[90vh]",
    large: "w-full h-full md:w-2/3 md:max-w-4xl md:h-auto md:max-h-[90vh]", // Alias for lg
    xl: "w-full h-full md:w-3/4 md:max-w-6xl md:h-auto md:max-h-[90vh]",
    full: "w-full h-full md:w-11/12 md:h-auto md:max-w-7xl md:max-h-[90vh]",
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white shadow-xl overflow-hidden rounded-none md:rounded-lg flex flex-col ${sizeClasses[size]}`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 h-full max-h-[calc(100vh-8rem)] md:max-h-[calc(90vh-8rem)]">
          {children}
        </div>
        {!title && showCloseButton && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

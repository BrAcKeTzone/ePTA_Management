import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      type = "text",
      placeholder,
      className = "",
      required = false,
      disabled = false,
      icon,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    const inputClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${
      error
        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300"
    }
    ${icon ? (iconPosition === "left" ? "pl-10" : "pr-10") : ""}
    ${className}
  `;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{icon}</span>
            </div>
          )}

          <input
            type={type}
            placeholder={placeholder}
            className={inputClasses}
            disabled={disabled}
            ref={ref}
            {...props}
          />

          {icon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{icon}</span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

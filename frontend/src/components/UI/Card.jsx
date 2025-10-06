import { forwardRef } from "react";

const Card = forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      padding = true,
      shadow = true,
      ...props
    },
    ref
  ) => {
    const baseClasses = "bg-white rounded-lg border border-gray-200";

    const variants = {
      default: "",
      elevated: shadow ? "shadow-lg" : "",
      outlined: "border-2",
      filled: "bg-gray-50",
    };

    const shadowClasses = shadow
      ? "shadow-sm hover:shadow-md transition-shadow duration-200"
      : "";
    const paddingClasses = padding ? "p-6" : "";

    const classes = `${baseClasses} ${variants[variant]} ${shadowClasses} ${paddingClasses} ${className}`;

    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header Component
const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`border-b border-gray-200 pb-4 mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Body Component
const CardBody = ({ children, className = "", ...props }) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
const CardFooter = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`border-t border-gray-200 pt-4 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter };

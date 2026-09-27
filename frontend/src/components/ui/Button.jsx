import { responsiveClasses } from "./responsive";

const variants = {
    primary: "bg-[#246b4d] text-white shadow-sm shadow-[#246b4d]/20 hover:bg-[#1d583f]",
    secondary: "bg-[#edf4e8] text-[#246b4d] hover:bg-[#e2edd9]",
    success: "bg-[#d9edb8] text-[#173d2d] hover:bg-[#cbe5a3]",
    cancel: "bg-[#fff1ef] text-[#b64d43] hover:bg-[#ffe4e0]",
    outline: "border border-[#dce5d7] bg-white text-[#365544] hover:border-[#8bad78] hover:bg-[#f7faf4]",
    ghost: "text-[#63786a] hover:bg-[#f1f5ed] hover:text-[#246b4d]",
    inline: "bg-transparent px-0 text-[#52735e] hover:text-[#246b4d]"
};

const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3.5 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base"
};

function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    as: Component = "button",
    type = "button",
    ...props
}) {
    return (
        <Component
            type={Component === "button" ? type : undefined}
            className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#87ad6e] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${responsiveClasses(size, sizes)} ${fullWidth ? "w-full" : ""} ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
}

export default Button;
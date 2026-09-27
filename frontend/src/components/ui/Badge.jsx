import { badgeSizes, responsiveClasses } from "./responsive";

function Badge({ children, size = "md", className = "", as: Component = "span" }) {
    return (
        <Component className={`inline-flex items-center gap-1.5 rounded-full bg-[#edf4e8] font-semibold text-[#52735e] ${responsiveClasses(size, badgeSizes)} ${className}`}>
            {children}
        </Component>
    );
}

export default Badge;
import { cardSizes, responsiveClasses } from "./responsive";

function Card({
    children,
    className = "",
    interactive = false,
    size,
    as: Component = "div",
    ...props
}) {
    return (
        <Component
            className={`rounded-2xl border border-[#e4eade] bg-white ${size ? responsiveClasses(size, cardSizes) : ""} ${interactive ? "cursor-pointer transition duration-300 hover:-translate-y-1 hover:border-[#b6cea5] hover:shadow-[0_16px_40px_-24px_rgba(36,107,77,0.45)]" : ""} ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
}

export default Card;
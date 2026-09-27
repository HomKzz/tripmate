import { gridColumns, responsiveGridColumns } from "./responsive";

function Grid({ children, columns: columnCount = 3, gap = "gap-6", className = "" }) {
    const columnClasses = typeof columnCount === "object"
        ? Object.entries(columnCount)
            .map(([breakpoint, count]) => {
                return responsiveGridColumns[breakpoint]?.[count] || "";
            })
            .filter(Boolean)
            .join(" ")
        : gridColumns[columnCount] || gridColumns[3];

    return (
        <div className={`grid ${columnClasses} ${gap} ${className}`}>
            {children}
        </div>
    );
}

export default Grid;
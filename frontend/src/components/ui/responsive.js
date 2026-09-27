const breakpoints = ["base", "sm", "md", "lg", "xl"];

const breakpointPrefixes = {
    base: "",
    sm: "sm:",
    md: "md:",
    lg: "lg:",
    xl: "xl:"
};

export function responsiveClasses(value, classMap) {
    if (typeof value === "string") {
        return classMap[value] || "";
    }

    return breakpoints
        .map((breakpoint) => {
            const selectedValue = value?.[breakpoint];
            const classes = selectedValue ? classMap[selectedValue] : "";

            return classes
                ? classes
                    .split(" ")
                    .map((className) => `${breakpointPrefixes[breakpoint]}${className}`)
                    .join(" ")
                : "";
        })
        .filter(Boolean)
        .join(" ");
}

export const badgeSizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
};

export const cardSizes = {
    sm: "p-4 rounded-xl",
    md: "p-5 rounded-2xl",
    lg: "p-6 rounded-2xl"
};

export const emptyStateSizes = {
    sm: "p-6",
    md: "p-8",
    lg: "p-12"
};

export const loadingStateSizes = {
    sm: "py-10",
    md: "py-16",
    lg: "py-20"
};

export const gridColumns = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
};

export const responsiveGridColumns = {
    base: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4"
    },
    sm: {
        1: "sm:grid-cols-1",
        2: "sm:grid-cols-2",
        3: "sm:grid-cols-3",
        4: "sm:grid-cols-4"
    },
    md: {
        1: "md:grid-cols-1",
        2: "md:grid-cols-2",
        3: "md:grid-cols-3",
        4: "md:grid-cols-4"
    },
    lg: {
        1: "lg:grid-cols-1",
        2: "lg:grid-cols-2",
        3: "lg:grid-cols-3",
        4: "lg:grid-cols-4"
    }
};
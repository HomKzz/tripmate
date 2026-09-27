import Button from "./Button";
import { emptyStateSizes, responsiveClasses } from "./responsive";

function EmptyState({
    icon = <span aria-hidden="true">✦</span>,
    title,
    description,
    actionLabel,
    onAction,
    size = "lg"
}) {
    return (
        <div className={`rounded-2xl border border-dashed border-[#cddcc3] bg-[#fbfcf8] text-center ${responsiveClasses(size, emptyStateSizes)}`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf4e8] text-3xl text-[#6b9355]">{icon}</div>
            <h2 className="mt-5 text-xl font-bold text-[#1d3b2e]">{title}</h2>
            {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7a8b7e]">{description}</p>}
            {actionLabel && onAction && (
                <Button className="mt-6" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

export default EmptyState;
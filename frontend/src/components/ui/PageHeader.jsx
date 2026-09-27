function PageHeader({ eyebrow, title, description, action }) {
    return (
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
                {eyebrow && <p className="mb-2 text-sm font-semibold tracking-wide text-[#6b9355]">{eyebrow}</p>}
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1d3b2e] sm:text-4xl">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7a8b7e] sm:text-base">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

export default PageHeader;
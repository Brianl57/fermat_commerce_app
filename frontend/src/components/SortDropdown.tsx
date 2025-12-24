import "../styles/SortDropdown.css";

type Props = {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

const SORT_OPTIONS = [
    { value: "", label: "Relevance" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
    { value: "popular", label: "Most Popular" },
];

export function SortDropdown({ value, onChange, disabled }: Props) {
    return (
        <select
            className="sort-dropdown"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        >
            {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

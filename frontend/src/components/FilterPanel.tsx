
type Props = {
    availableCategories: string[];
    availableBrands: string[];
    selectedCategories: string[];
    selectedBrands: string[];
    priceCap: number;
    loading: boolean;
    onChangeCategory: (category: string) => void;
    onChangeBrand: (brand: string) => void;
    onChangePrice: (price: number) => void;
    onClearFilters: () => void;
};

export function FilterPanel({
    availableCategories,
    availableBrands,
    selectedCategories,
    selectedBrands,
    priceCap,
    loading,
    onChangeCategory,
    onChangeBrand,
    onChangePrice,
    onClearFilters,
}: Props) {
    // Styles for disabled state
    const sideBarClassName = loading ? "filter-sidebar disabled" : "filter-sidebar";

    return (
        <aside className={sideBarClassName}>
            <div className="filter-header">
                <h2 className="filter-title">Filters</h2>
                <button
                    onClick={onClearFilters}
                    className="clear-btn"
                >
                    Clear All
                </button>
            </div>

            {/* Price Filter */}
            <div className="filter-section">
                <label className="filter-section-title">Price</label>
                <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceCap}
                    onChange={(e) => onChangePrice(Number(e.target.value))}
                    className="filter-price-range"
                />
                <div className="price-label">
                    $0 – {priceCap >= 500 ? "$500+" : `$${priceCap}`}
                </div>
            </div>

            {/* Category Filter */}
            <div className="filter-section">
                <span className="filter-section-title">Category</span>
                <div className="filter-options-list">
                    {availableCategories.map((cat) => (
                        <label key={cat} className="filter-option">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat)}
                                onChange={() => onChangeCategory(cat)}
                            />
                            {cat}
                        </label>
                    ))}
                </div>
            </div>

            {/* Brand Filter */}
            <div className="filter-section">
                <span className="filter-section-title">Brand</span>
                <div className="filter-options-list">
                    {availableBrands.map((brand) => (
                        <label key={brand} className="filter-option">
                            <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => onChangeBrand(brand)}
                            />
                            {brand}
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
}

const SearchFilter = ({
  filters,
  categories,
  onChange,
  onSubmit,
  onReset,
}) => {
  return (
    <form onSubmit={onSubmit} className="panel p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <input
          className="input xl:col-span-2"
          placeholder="Search products, tags, categories..."
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
        />
        <select
          className="input"
          value={filters.category}
          onChange={(event) => onChange("category", event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.sortBy}
          onChange={(event) => onChange("sortBy", event.target.value)}
        >
          <option value="latest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="trending">Trending</option>
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(event) => onChange("minPrice", event.target.value)}
          />
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(event) => onChange("maxPrice", event.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" className="btn-primary">
          Apply filters
        </button>
        <button type="button" className="btn-secondary" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
};

export default SearchFilter;

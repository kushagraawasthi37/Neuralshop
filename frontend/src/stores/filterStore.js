import { create } from "zustand";

const initialState = {
  // Search
  searchQuery: "",
  searchResults: [],
  isSearching: false,

  // Product filters
  filters: {
    category: "",
    priceRange: { min: 0, max: 10000 },
    rating: 0,
    brand: "",
    size: "",
    color: "",
    inStock: false,
    onSale: false,
  },

  // Sort options
  sortBy: "relevance",
  sortOrder: "desc",

  // Pagination
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 20,
  totalItems: 0,

  // Filter options (for dropdowns)
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
  priceRanges: [],
};

export const useFilterStore = create((set, get) => ({
  ...initialState,

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  setSearchResults: (results, totalItems = 0) =>
    set((state) => ({
      searchResults: results,
      totalItems,
      totalPages: Math.ceil(totalItems / state.itemsPerPage),
      isSearching: false,
    })),

  setSearching: (searching) => set({ isSearching: searching }),

  clearSearch: () =>
    set({
      searchQuery: "",
      searchResults: [],
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    }),

  // Filter actions
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1, // Reset to first page when filters change
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1,
    })),

  removeFilter: (key) =>
    set((state) => {
      const { [key]: removed, ...rest } = state.filters;
      return {
        filters: rest,
        currentPage: 1,
      };
    }),

  clearFilters: () =>
    set((state) => ({
      filters: initialState.filters,
      currentPage: 1,
    })),

  // Sort actions
  setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }),

  setSortOrder: (sortOrder) => set({ sortOrder, currentPage: 1 }),

  // Pagination actions
  setCurrentPage: (page) =>
    set((state) => ({
      currentPage: Math.max(1, Math.min(page, state.totalPages)),
    })),

  setItemsPerPage: (itemsPerPage) =>
    set((state) => ({
      itemsPerPage,
      currentPage: 1,
      totalPages: Math.ceil(state.totalItems / itemsPerPage),
    })),

  nextPage: () =>
    set((state) => ({
      currentPage: Math.min(state.currentPage + 1, state.totalPages),
    })),

  prevPage: () =>
    set((state) => ({
      currentPage: Math.max(state.currentPage - 1, 1),
    })),

  goToPage: (page) => get().setCurrentPage(page),

  // Filter options actions
  setCategories: (categories) => set({ categories }),

  setBrands: (brands) => set({ brands }),

  setSizes: (sizes) => set({ sizes }),

  setColors: (colors) => set({ colors }),

  setPriceRanges: (priceRanges) => set({ priceRanges }),

  // Getters
  getActiveFilters: () => {
    const filters = get().filters;
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (
        value !== "" &&
        value !== 0 &&
        value !== false &&
        !(typeof value === "object" && value.min === 0 && value.max === 10000)
      ) {
        acc[key] = value;
      }
      return acc;
    }, {});
  },

  hasActiveFilters: () => {
    return Object.keys(get().getActiveFilters()).length > 0;
  },

  getFilterQuery: () => {
    const activeFilters = get().getActiveFilters();
    const { sortBy, sortOrder, currentPage, itemsPerPage } = get();

    return {
      ...activeFilters,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: itemsPerPage,
    };
  },

  getPaginationInfo: () => {
    const { currentPage, totalPages, itemsPerPage, totalItems } = get();
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  },

  // Reset
  reset: () => set(initialState),
}));

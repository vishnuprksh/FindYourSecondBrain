import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AppCard from '../components/AppCard';
import SearchBar from '../components/SearchBar';
import { HiOutlineFilter, HiOutlineSortDescending, HiOutlineTag, HiOutlineCurrencyDollar } from 'react-icons/hi';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest', icon: '🆕' },
  { label: 'Oldest First', value: 'oldest', icon: '📅' },
  { label: 'Top Rated', value: 'top-rated', icon: '⭐' },
  { label: 'Most Reviewed', value: 'most-reviewed', icon: '💬' },
  { label: 'Name A-Z', value: 'name-asc', icon: '🔤' },
  { label: 'Name Z-A', value: 'name-desc', icon: '🔡' },
];

const PRICING_OPTIONS = [
  { label: 'All Pricing', value: 'all' },
  { label: 'Free', value: 'Free' },
  { label: 'Freemium', value: 'Freemium' },
  { label: 'Paid', value: 'Paid' },
];

export default function HomePage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'apps'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApps(appList);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Get unique categories and tags from apps
  const { categories, allTags } = useMemo(() => {
    const categorySet = new Set();
    const tagSet = new Set();

    apps.forEach(app => {
      if (app.category) categorySet.add(app.category);
      if (app.tags && Array.isArray(app.tags)) {
        app.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return {
      categories: ['All', ...Array.from(categorySet).sort()],
      allTags: Array.from(tagSet).sort()
    };
  }, [apps]);

  // Filter & sort logic
  const filteredAndSortedApps = useMemo(() => {
    let filtered = apps;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(app =>
        app.name?.toLowerCase().includes(searchLower) ||
        app.description?.toLowerCase().includes(searchLower) ||
        app.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Pricing filter
    if (selectedPricing !== 'all') {
      filtered = filtered.filter(app => app.pricing === selectedPricing);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(app =>
        selectedTags.every(tag => app.tags?.includes(tag))
      );
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
        case 'top-rated':
          const avgA = a.ratingCount > 0 ? a.ratingSum / a.ratingCount : 0;
          const avgB = b.ratingCount > 0 ? b.ratingSum / b.ratingCount : 0;
          return avgB - avgA;
        case 'most-reviewed':
          return (b.ratingCount || 0) - (a.ratingCount || 0);
        case 'name-asc':
          return a.name?.localeCompare(b.name) || 0;
        case 'name-desc':
          return b.name?.localeCompare(a.name) || 0;
        case 'newest':
        default:
          return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
      }
    });

    return sorted;
  }, [apps, search, selectedCategory, selectedPricing, selectedTags, sortBy]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedPricing('all');
    setSelectedTags([]);
    setSortBy('newest');
  };

  const hasActiveFilters = search || selectedCategory !== 'All' || selectedPricing !== 'all' || selectedTags.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Discover Your Second Brain
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
          A community-driven directory of the best personal knowledge management tools.
          Find, rate, and review apps that help you think better.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="max-w-2xl mx-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search apps by name, description, or tags..."
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Primary Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-400 mr-2 self-center">Category:</span>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Advanced Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <HiOutlineSortDescending className="text-gray-400" size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-700 rounded-lg px-3 py-1.5 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                showAdvancedFilters
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <HiOutlineFilter className="inline mr-1" size={14} />
              Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pricing Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HiOutlineCurrencyDollar className="inline mr-1" size={14} />
                  Pricing Model
                </label>
                <select
                  value={selectedPricing}
                  onChange={(e) => setSelectedPricing(e.target.value)}
                  className="w-full text-sm border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {PRICING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HiOutlineTag className="inline mr-1" size={14} />
                  Tags ({selectedTags.length} selected)
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {allTags.slice(0, 20).map((tag) => (
                    <label key={tag} className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="mr-2 rounded border-gray-600 text-brand-600 focus:ring-brand-500/20"
                      />
                      <span className="text-gray-400">{tag}</span>
                    </label>
                  ))}
                  {allTags.length > 20 && (
                    <div className="text-xs text-gray-500 pt-1">
                      ... and {allTags.length - 20} more tags
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-gray-400">Active filters:</span>
            {search && (
              <span className="bg-brand-600/20 text-brand-400 px-2 py-1 rounded">
                Search: "{search}"
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                Category: {selectedCategory}
              </span>
            )}
            {selectedPricing !== 'all' && (
              <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">
                Pricing: {selectedPricing}
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                Tag: {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* App Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-800 rounded" />
                <div className="h-3 bg-gray-800 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedApps.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">No apps found</h3>
          <p className="text-gray-500 text-sm">
            {hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'Be the first to submit a second brain app!'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}

      {/* Stats footer */}
      {!loading && apps.length > 0 && (
        <div className="text-center mt-10 text-sm text-gray-600">
          Showing {filteredAndSortedApps.length} of {apps.length} apps
          {hasActiveFilters && (
            <span className="block mt-1 text-xs">
              {filteredAndSortedApps.length === apps.length
                ? 'No filters applied'
                : `${apps.length - filteredAndSortedApps.length} apps filtered out`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

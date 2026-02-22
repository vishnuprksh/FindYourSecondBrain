import { HiSearch, HiX } from 'react-icons/hi';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search apps...'}
        className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition placeholder:text-gray-500"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <HiX size={16} />
        </button>
      )}
    </div>
  );
}

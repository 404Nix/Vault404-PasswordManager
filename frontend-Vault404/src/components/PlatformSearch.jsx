import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, Loader, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

// ─── Slug helper (mirrors simple-icons' own slug algorithm) ──────
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\./g, 'dot')
    .replace(/&/g, 'and')
    .replace(/đ/g, 'd')
    .replace(/ħ/g, 'h')
    .replace(/ı/g, 'i')
    .replace(/ĸ/g, 'k')
    .replace(/ŀ/g, 'l')
    .replace(/ł/g, 'l')
    .replace(/ß/g, 'ss')
    .replace(/ŧ/g, 't')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// ─── Singleton icon cache ────────────────────────────────────────
let _iconCache = null;
let _fetchPromise = null;

function fetchIcons() {
  if (_iconCache) return Promise.resolve(_iconCache);
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch(
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/_data/simple-icons.json'
  )
    .then((res) => res.json())
    .then((data) => {
      // The JSON is an array of objects – normalise to { title, slug }
      const items = (Array.isArray(data) ? data : data.icons || []).map(
        (icon) => ({
          title: icon.title,
          slug: icon.slug || toSlug(icon.title),
          hex: icon.hex,
        })
      );
      _iconCache = items;
      return items;
    })
    .catch(() => {
      _fetchPromise = null;
      return [];
    });

  return _fetchPromise;
}

// ─── Component ───────────────────────────────────────────────────
const PlatformSearch = ({ value, onChange }) => {
  const { theme } = useSelector((state) => state.ui);
  const [query, setQuery] = useState(value?.platformName || '');
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  // Load icon data once
  useEffect(() => {
    setLoading(true);
    fetchIcons().then((data) => {
      setIcons(data);
      setLoading(false);
    });
  }, []);

  // Sync external value → local query
  useEffect(() => {
    setQuery(value?.platformName || '');
  }, [value?.platformName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter icons (max 40 results for perf)
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return icons
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.slug.includes(q)
      )
      .slice(0, 40);
  }, [query, icons]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex];
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const select = useCallback(
    (icon) => {
      setQuery(icon.title);
      setOpen(false);
      setHighlightIndex(-1);
      onChange({ platformName: icon.title, platformSlug: icon.slug });
    },
    [onChange]
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    setHighlightIndex(-1);
    // Clear stored selection when user edits
    if (value?.platformName !== val) {
      onChange({ platformName: val, platformSlug: '' });
    }
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      select(results[highlightIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const clearInput = () => {
    setQuery('');
    setOpen(false);
    onChange({ platformName: '', platformSlug: '' });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-bold text-textSecondary tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" /> Platform
      </label>

      <div className="relative">
        {/* Icon preview if a slug is selected */}
        {value?.platformSlug ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center p-1 group">
            <img
              src={`https://cdn.simpleicons.org/${value.platformSlug}/${theme === 'dark' ? 'ffffff' : '0f172a'}`}
              alt=""
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
              onError={(e) => (e.target.parentElement.style.display = 'none')}
            />
          </div>
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
        )}

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search platforms… e.g. GitHub"
          autoComplete="off"
          required
          className="w-full bg-bgSecondary border border-border rounded-xl py-2.5 pl-12 pr-9 focus:outline-none focus:border-accentPrimary text-sm transition-all duration-300"
        />

        {loading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary animate-spin" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Dropdown ──────────────────────────────────────── */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            ref={listRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full max-h-52 overflow-y-auto rounded-xl border border-border bg-bgSecondary shadow-lg"
          >
            {results.map((icon, idx) => {
              const isHighlighted = idx === highlightIndex;
              return (
                <li
                  key={icon.slug}
                  onMouseDown={() => select(icon)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm transition-colors ${
                    isHighlighted
                      ? 'bg-accentPrimary/15 text-textPrimary'
                      : 'hover:bg-accentPrimary/10 text-textSecondary'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <img
                      src={`https://cdn.simpleicons.org/${icon.slug}/${theme === 'dark' ? 'ffffff' : icon.hex}`}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={(e) => (e.target.parentElement.style.visibility = 'hidden')}
                      loading="lazy"
                    />
                  </div>
                  <span className="truncate">{icon.title}</span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {open && query.trim() && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-bgSecondary p-3 text-xs text-textSecondary text-center">
          No platforms found for "<span className="text-textPrimary">{query}</span>"
        </div>
      )}
    </div>
  );
};

export default PlatformSearch;

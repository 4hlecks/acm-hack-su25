import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Search, X } from 'react-feather';
import bar from './SearchBar.module.css';
import resultsStyles from './SearchResults.module.css';
import SearchResults from './SearchResults';

export default function SearchBar() {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'clubs'

  const inputRef = useRef(null);
  const barRef = useRef(null);
  const [dropdownHeight, setDropdownHeight] = useState(0); // for unified shadow

  const onChange = (e) => setValue(e.target.value);
  const clear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  // “Open” whenever focused (you can require non-empty value if you prefer)
  const open = focused;

  // Demo data (replace with real results later)
  const allResults = useMemo(() => {
    const sample = [
      {
        type: 'event',
        id: 'e1',
        title: 'Triton Fest: Welcome Bash',
        coverUrl: '/img/sample/event1.jpg',
        owner: { name: 'AS Concerts & Events', avatarUrl: '/img/sample/asce.jpg' },
      },
      {
        type: 'event',
        id: 'e2',
        title: 'ACM Hack Night',
        coverUrl: '/img/sample/event2.jpg',
        owner: { name: 'ACM @ UCSD', avatarUrl: '/img/sample/acm.jpg' },
      },
      {
        type: 'club',
        id: 'c1',
        name: 'IEEE @ UCSD',
        avatarUrl: '/img/sample/ieee.jpg',
      },
      {
        type: 'club',
        id: 'c2',
        name: 'Triton Gaming',
        avatarUrl: '/img/sample/tg.jpg',
      },
      {
        type: 'event',
        id: 'e3',
        title: 'CSE Mentorship Mixer',
        coverUrl: '/img/sample/event3.jpg',
        owner: { name: 'CSES', avatarUrl: '/img/sample/cses.jpg' },
      },
      {
        type: 'club',
        id: 'c3',
        name: 'Design Co',
        avatarUrl: '/img/sample/dco.jpg',
      },
    ];

    const q = value.trim().toLowerCase();
    if (!q) return sample;

    return sample.filter((item) => {
      const hay = (item.title || item.name || '').toLowerCase();
      const owner = item.owner?.name?.toLowerCase() || '';
      return hay.includes(q) || owner.includes(q);
    });
  }, [value]);

  const eventResults = useMemo(
    () => allResults.filter((r) => r.type === 'event').slice(0, 5),
    [allResults]
  );
  const clubResults = useMemo(
    () => allResults.filter((r) => r.type === 'club').slice(0, 5),
    [allResults]
  );

  // Unified shadow height (bar height + current dropdown measured in child)
  useLayoutEffect(() => {
    const barH = barRef.current?.offsetHeight || 0;
    const h = open ? barH + dropdownHeight : barH;
    // set CSS var inline
    if (barRef.current) {
      barRef.current.style.setProperty('--combo-shadow-h', `${h}px`);
    }
  }, [open, dropdownHeight]);

  const handleSelect = (text) => {
    setValue(text);
    inputRef.current?.blur(); // close
  };

  return (
    <form
      role="search"
      ref={barRef}
      className={`${bar.searchBar} ${open ? bar.open : ''}`}
      onSubmit={(e) => e.preventDefault()}
      aria-label="Search events and clubs"
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <label className={bar.searchInput}>
        <Search className={bar.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          className={bar.searchInputField}
          type="search"
          placeholder="Search for events or clubs..."
          aria-label="Search"
          value={value}
          onChange={onChange}
          onKeyDown={(e) => { if (e.key === 'Escape' && value) clear(); }}
          autoComplete="off"
          aria-expanded={open}
          aria-controls="search-results"
        />
        {value && (
          <button
            type="button"
            className={bar.clearButton}
            onClick={clear}
            aria-label="Clear search"
            title="Clear"
          >
            <X className={bar.clearIcon} aria-hidden="true" />
          </button>
        )}
      </label>

      {/* Search Results Dropdown */}
      {open && (
        <SearchResults
          id="search-results"
          query={value}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          events={eventResults}
          clubs={clubResults}
          onSelect={handleSelect}
          onHeightChange={setDropdownHeight}
          className={resultsStyles.searchResults}
        />
      )}
    </form>
  );
}

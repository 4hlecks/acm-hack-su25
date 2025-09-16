import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Search, X } from 'react-feather';
import bar from './SearchBar.module.css';
import resultsStyles from './SearchResults.module.css';
import SearchResults from './SearchResults';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function SearchBar({onEventClick, onClubSelect}) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'clubs'
  const [searchResults, setSearchResults] = useState({events : [], clubs: []});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownHeight, setDropdownHeight] = useState(0); // for unified shadow

  const inputRef = useRef(null);
  const barRef = useRef(null);

  // “Open” whenever focused (you can require non-empty value if you prefer)
  const open = focused;

  useEffect(() => {
    if (!value.trim()){
      setSearchResults({events: [], clubs: []})
      return;
    }

    const timeoutId = setTimeout(async () => { //Runs and renders after user types in a value
      setLoading(true);
      setError(null);
      try{
        const response = await fetch(`${API_BASE}/api/search/all?query=${encodeURIComponent(value.trim())}`);
        if (!response.ok){
          throw new Error('Search failed');
        }

        const data = await response.json();
        setSearchResults({
          events: data.events || [],
          clubs: data.clubs || []
        });
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.')
        setSearchResults({events: [], clubs: []});
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);
  

  // Unified shadow height (bar height + current dropdown measured in child)
  useLayoutEffect(() => {
    const barH = barRef.current?.offsetHeight || 0;
    const h = open ? barH + dropdownHeight : barH;
    // set CSS var inline
    if (barRef.current) {
      barRef.current.style.setProperty('--combo-shadow-h', `${h}px`);
    }
  }, [open, dropdownHeight]);

  const onChange = (e) => setValue(e.target.value);
  const clear = () => {
    setValue('');
    setSearchResults({events: [], clubs: []});
    inputRef.current?.focus();
  };

  // const handleSearchSubmit = (e) => {}
  //   e.preventDefault();
  //   if (value.trim()){

  //   }
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
          events={searchResults.events}
          clubs={searchResults.clubs}
          onEventSelect={onEventClick}
          onClubSelect={onClubSelect}
          onHeightChange={setDropdownHeight}
          className={resultsStyles.searchResults}
          loading={loading}
          error={error}
        />
      )}
    </form>
  );
}

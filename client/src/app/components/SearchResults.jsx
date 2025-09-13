import React, { useEffect, useMemo, useRef } from 'react';
import styles from './SearchResults.module.css';

export default function SearchResults({
  id,
  query,
  activeTab,
  onTabChange,
  events,
  clubs,
  onSelect,
  onHeightChange,
  className,
}) {
  const containerRef = useRef(null);

  // Report height to parent (for unified shadow). Respect max-height (18rem) in CSS.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const MAX = 18 * 16; // 18rem
    const report = () => onHeightChange?.(Math.min(el.scrollHeight, MAX));
    report();

    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange, activeTab, events.length, clubs.length]);

  const eventCount = events.length;
  const clubCount = clubs.length;

  const onTabsKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onTabChange(activeTab === 'events' ? 'clubs' : 'events');
    }
  };

  const rendered = useMemo(() => {
    if (activeTab === 'events') {
      return (
        <ul className={styles.resultList} role="list">
          {events.slice(0, 5).map((ev) => (
            <li key={ev.id} className={`${styles.resultItem} ${styles.eventItem}`}>
              <button
                type="button"
                className={styles.resultRow}
                onClick={() => onSelect?.(ev.title)}
                aria-label={`Open event ${ev.title}`}
              >
                <figure className={`${styles.thumb} ${styles.eventThumb}`} aria-hidden="true">
                  <img src={ev.coverUrl} alt="Event Cover Image" />
                </figure>
                <div className={styles.eventMetadata}>
                  <h3 className={styles.title}>{ev.title}</h3>
                  <figure className={styles.ownerRow}>
                    <img
                      className={styles.ownerAvatar}
                      src={ev.owner?.avatarUrl}
                      alt={ev.owner?.name ? `${ev.owner.name} profile` : 'Organizer profile'}
                    />
                    <figcaption className={styles.ownerName}>{ev.owner?.name}</figcaption>
                  </figure>
                </div>
              </button>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <ul className={styles.resultList} role="list">
        {clubs.slice(0, 5).map((cl) => (
          <li key={cl.id} className={`${styles.resultItem} ${styles.clubItem}`}>
            <button
              type="button"
              className={styles.resultRow}
              onClick={() => onSelect?.(cl.name)}
              aria-label={`Open club ${cl.name}`}
            >
              <figure className={`${styles.thumb} ${styles.clubThumb}`} aria-hidden="true">
                <img src={cl.avatarUrl} alt="Club Profile Picture" />
              </figure>
              <div className={styles.eventMetadata}>
                <h3 className={styles.title}>{cl.name}</h3>
              </div>
            </button>
          </li>
        ))}
      </ul>
    );
  }, [activeTab, events, clubs, onSelect]);

  const leftLabel =
    activeTab === 'events' ? `${eventCount} events` : `${clubCount} clubs`;
  const viewAllLabel =
    activeTab === 'events'
      ? `View "${query || 'all'}" events`
      : `View "${query || 'all'}" clubs`;

  return (
    <div
      id={id}
      ref={containerRef}
      className={`${styles.searchResults} ${className || ''}`}
      role="region"
      aria-label="Search results"
    >
      {/* Tabs */}
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Search categories"
        onKeyDown={onTabsKeyDown}
      >
        <button
          id="tab-events"
          role="tab"
          aria-selected={activeTab === 'events'}
          aria-controls="events-panel"
          tabIndex={activeTab === 'events' ? 0 : -1}
          className={`${styles.tab} ${activeTab === 'events' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('events')}
          type="button"
        >
          Events
        </button>
        <button
          id="tab-clubs"
          role="tab"
          aria-selected={activeTab === 'clubs'}
          aria-controls="clubs-panel"
          tabIndex={activeTab === 'clubs' ? 0 : -1}
          className={`${styles.tab} ${activeTab === 'clubs' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('clubs')}
          type="button"
        >
          Clubs
        </button>
      </div>

      {/* Result count section */}
      <div className={styles.resultCountSection}>
        <strong className={styles.resultCount}>{leftLabel}</strong>
        <button type="button" className={styles.viewAllButton} aria-label={viewAllLabel}>
          {viewAllLabel}
        </button>
      </div>

      {/* Panels (we swap the whole list via memo above) */}
      <div
        id="events-panel"
        role="tabpanel"
        aria-labelledby="tab-events"
        hidden={activeTab !== 'events'}
      >
        {activeTab === 'events' && rendered}
      </div>

      <div
        id="clubs-panel"
        role="tabpanel"
        aria-labelledby="tab-clubs"
        hidden={activeTab !== 'clubs'}
      >
        {activeTab === 'clubs' && rendered}
      </div>
    </div>
  );
}

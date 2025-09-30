import React, { useEffect, useMemo, useRef } from 'react';
import styles from './SearchResults.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

// Return a safe URL or null (never an empty string)
function safeSrc(url) {
  if (!url) return null;
  const u = String(url).trim();
  if (!u) return null;
  // optional: normalize /uploads paths from server
  if (u.startsWith('/uploads')) return `${API_BASE}${u}`;
  return u;
}

export default function SearchResults({
  id,
  query,
  activeTab,
  onTabChange,
  events,
  clubs,
  onEventSelect,
  onClubSelect,
  onHeightChange,
  className,
  loading,
  error
}) {
  const containerRef = useRef(null);

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

  const handleEventSelect = (event) => onEventSelect?.(event);
  const handleClubSelect  = (club)  => onClubSelect?.(club);

  const rendered = useMemo(() => {
    if (activeTab === 'events') {
      return (
        <ul className={styles.resultList} role="list">
          {events.slice(0, 5).map((ev) => {
            const cover = safeSrc(ev.coverPhoto);
            const ownerPic = safeSrc(ev.eventOwner?.profilePic);
            return (
              <li key={ev._id} className={`${styles.resultItem} ${styles.eventItem}`}>
                <button
                  type="button"
                  className={styles.resultRow}
                  onClick={() => handleEventSelect(ev)}
                  aria-label={`Open event ${ev.eventTitle}`}
                >
                  <figure className={`${styles.thumb} ${styles.eventThumb}`} aria-hidden="true">
                    {cover ? (
                      <img src={cover} alt="" />
                    ) : (
                      <div className={styles.thumbFallback} />
                    )}
                  </figure>
                  <div className={styles.eventMetadata}>
                    <h3 className={styles.title}>{ev.eventTitle}</h3>
                    <figure className={styles.ownerRow}>
                      {ownerPic ? (
                        <img
                          className={styles.ownerAvatar}
                          src={ownerPic}
                          alt={ev.eventOwner?.name ? `${ev.eventOwner.name} profile` : 'Organizer profile'}
                        />
                      ) : (
                        <div className={`${styles.ownerAvatar} ${styles.avatarFallback}`} aria-hidden="true" />
                      )}
                      <figcaption className={styles.ownerName}>{ev.eventOwner?.name}</figcaption>
                    </figure>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <ul className={styles.resultList} role="list">
        {clubs.slice(0, 5).map((cl) => {
          const pic = safeSrc(cl.profilePic);
          return (
            <li key={cl._id} className={`${styles.resultItem} ${styles.clubItem}`}>
              <button
                type="button"
                className={styles.resultRow}
                onClick={() => handleClubSelect(cl)}
                aria-label={`Open club ${cl.name}`}
              >
                <figure className={`${styles.thumb} ${styles.clubThumb}`} aria-hidden="true">
                  {pic ? (
                    <img src={pic} alt="" />
                  ) : (
                    <div className={styles.thumbFallback} />
                  )}
                </figure>
                <div className={styles.eventMetadata}>
                  <h3 className={styles.title}>{cl.name}</h3>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }, [activeTab, events, clubs]);

  const leftLabel   = activeTab === 'events' ? `${eventCount} events` : `${clubCount} clubs`;
  const viewAllLabel =
    activeTab === 'events'
      ? `View "${query || 'all'}" events`
      : `View "${query || 'all'}" clubs`;

  if (loading){
    return (
      <div id={id} ref={containerRef} className={`${styles.searchResults} ${className || ''}`} role="region" aria-label="Search results">
        <div className={styles.loadingState}><p>Searching...</p></div>
      </div>
    );
  }

  if (error){
    return (
      <div id={id} ref={containerRef} className={`${styles.searchResults} ${className || ''}`} role="region" aria-label="Search results">
        <div className={styles.errorState}><p>{error}</p></div>
      </div>
    );
  }

  return (
    <div
      id={id}
      ref={containerRef}
      className={`${styles.searchResults} ${className || ''}`}
      role="region"
      aria-label="Search results"
    >
      {/* Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Search categories" onKeyDown={onTabsKeyDown}>
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

      {/* Panels */}
      <div id="events-panel" role="tabpanel" aria-labelledby="tab-events" hidden={activeTab !== 'events'}>
        {activeTab === 'events' && rendered}
      </div>
      <div id="clubs-panel" role="tabpanel" aria-labelledby="tab-clubs" hidden={activeTab !== 'clubs'}>
        {activeTab === 'clubs' && rendered}
      </div>
    </div>
  );
}

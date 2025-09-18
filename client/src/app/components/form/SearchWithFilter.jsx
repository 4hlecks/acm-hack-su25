'use client';
import React, { useId } from 'react';
import styles from './SearchWithFilter.module.css';
import { Search, X, ChevronDown } from 'react-feather';

/**
 * Props:
 * 	- query, onQueryChange
 *  - filterKey, onFilterKeyChange // this is column key to filter by
 *  - filterOptions: { value: string, label: string }[]; built from columns
 *  - onSubmit?: ({ query, filterKey }) => void
 *  - placeholder?: string
 *  - className?: string
 */
export default function SearchWithFilter({
	query,
	onQueryChange,
	filterKey,
	onFilterKeyChange,
	filterOptions = [],
	onSubmit,
	placeholder = '',
	className = '',
}) {
	const searchId = useId();
	const filterId = useId();

	const selectedLabel = filterOptions.find(o => o.value === filterKey)?.label ?? '';
	
	function handleSubmit(e) {
		e.preventDefault();
		onSubmit?.({ query, filterKey });
	}

	return (
		<form
			role="search"
			className={`${styles.searchBar} ${className}`}
			onSubmit={handleSubmit}
			aria-label="Search with several filter options"
		>
			<div className={styles.left}>
				<Search className={styles.icon} aria-hidden />
				<input
					id={searchId}
					className={styles.input}
					type="search"
					placeholder={placeholder}
					value={query}
					onChange={(e) => onQueryChange?.(e.target.value)}
					aria-label="Search query"
					autoComplete="off"
				/>
				{query && (
					<button
						type="button"
						className={styles.clearButton}
						onClick={() => onQueryChange?.('')}
						aria-label="Clear search"
						title="Clear"
					>
						<X aria-hidden className={styles.icon} />
					</button>
				)}
			</div>
			<div className={styles.right}>
				<span className={styles.filterText}>
					Filter by:&nbsp;<strong className={styles.filterChoice}>
						{selectedLabel || '-'}
					</strong> &nbsp;
					<ChevronDown className={styles.icon} aria-hidden />
				</span>

				<select
					id={filterId}
					className={styles.filterSelect}
					value={filterKey}
					onChange={(e) => onFilterKeyChange?.(e.target.value)}
					aria-label="Filter column"
				>
					{filterOptions.map(opt => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
					))}
				</select>
			</div>
		</form>
	)
}
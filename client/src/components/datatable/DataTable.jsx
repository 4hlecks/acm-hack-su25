'use client';
import styles from './DataTable.module.css'
import { useState, useMemo } from 'react';
import { ArrowDown } from 'react-feather';
import { SortAscend, SortDescend } from './SortIcons';

export default function DataTable({ columns, data, rowKey, stickyHeader = true }) {
    const [sort, setSort] = useState({ key: null, dir: null });

    const toggleSort = (key) => {
        setSort((prev) => {
            if (prev.key !== key) return { key, dir: 'asc' }; // ascend
            if (prev.dir === 'asc') return { key, dir: 'desc' }; // descend
            return { key: null, dir: null }; // third click removes sort
        });
    };

    const sortedData = useMemo(() => {
        if (!sort.key || !sort.dir) return data;
        const dirMul = sort.dir === 'asc' ? 1 : -1;
        return [...data].sort((a, b) => {
            const av = a[sort.key];
            const bv = b[sort.key];

            // compare timestamp
            const aVal = av instanceof Date ? av.getTime() : av;
            const bVal = bv instanceof Date ? bv.getTime() : bv;
            if (aVal == null && bVal != null) return -1 * dirMul;
            if (aVal != null && bVal == null) return 1 * dirMul;
            if (aVal == null && bVal == null) return 0;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return (aVal - bVal) * dirMul;
            }
            return String(aVal).localeCompare(String(bVal)) * dirMul;
        });
    }, [data, sort]);

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr className={styles.row}>
                        {columns.map((col) => {
                            const isActive = sort.key === col.key && !!sort.dir;
                            const ariaSort =
                                sort.key === col.key ? (sort.dir === 'asc' ?
                                'ascending' : 'descending') : 'none';
                            return (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={styles.th}
                                    aria-sort={ariaSort}
                                    data-sortable={col.sortable ? '' : undefined}
                                >
                                    {col.sortable ? (
                                        <button
                                            type="button"
                                            className={styles.thContent}
                                            onClick={() => toggleSort(col.key)}
                                            aria-label={
                                            isActive
                                                ? `${col.header}, sorted ${sort.dir}. Click to ${
                                                    sort.dir === 'asc' ? 'sort descending' : 'clear sort'
                                                }`
                                                : `${col.header}, not sorted. Click to sort ascending`
                                            }
                                            data-sortable={col.sortable ? '' : undefined}
                                        >
                                            {col.icon ?? null}
                                            {col.header}
                                            {isActive ? ( sort.dir === 'asc' ?
                                                <SortAscend className={styles.icon} /> :
                                                <SortDescend className={styles.icon} /> ) :
                                                (<ArrowDown className={styles.icon} />)
                                            }
                                        </button>
                                    ) : (
                                        <span className={styles.thContent}>
                                            {col.icon ?? null}
                                            <span className={styles.thLabel}>
                                                {col.header}
                                            </span>
                                        </span>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    {sortedData.length === 0 ? (
                        <tr className={styles.row}>
                            <td className={styles.td} colSpan={columns.length}>
                                <em>No results</em>
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((row) => (
                            <tr key={rowKey(row)} className={styles.row}>
                                {columns.map((col) => (
                                    <td key={col.key} className={styles.td}>
                                        {col.render ? col.render(row) : String(row[col.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
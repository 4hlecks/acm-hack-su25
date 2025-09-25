/* Write the code for the SortDropdown component */
import React from 'react';

function SortDropdown({ options, onsortChange}){
    return (
        <div className="sort-dropdown"> 
        <select onChange={onsortChange} className="sort-select"> 
            {options.map((option, index) => (
            <option key={index} value={option.value}>
                {option.label}
            </option>
            ))}
        </select>
        </div>
    );
}
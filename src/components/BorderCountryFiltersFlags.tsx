// BorderCountryFiltersFlags.tsx (or .jsx)
import React from 'react';
import '../css/borderCountries.css'; // Make sure your CSS is imported
import type { BorderCountryFilterType } from './BorderCountryFilter'; // Assuming Home.ts or Home.tsx
import BorderCountryFlagItem from './BorderCountryFlagItem'; // Import the new component

interface BorderCountryFiltersFlagsProps {
    borderCountryFilters: BorderCountryFilterType[];
    removeBorderCountryFilter: (cca3: string) => void;
    fadingOutFlags: Set<string>; // New prop
}

function BorderCountryFiltersFlags({
    borderCountryFilters,
    removeBorderCountryFilter,
    fadingOutFlags,
}: BorderCountryFiltersFlagsProps) {
    return (
        <div className="border-country-flags-container">
            {borderCountryFilters.length > 0 ? (
                borderCountryFilters.map((countryFilter, index) => (
                    <BorderCountryFlagItem
                        key={index}
                        countryFilter={countryFilter}
                        removeBorderCountryFilter={removeBorderCountryFilter}
                        isFadingOut={fadingOutFlags.has(countryFilter.cca3)}
                    />
                ))
            ) : null}
        </div>
    );
}

export default BorderCountryFiltersFlags;
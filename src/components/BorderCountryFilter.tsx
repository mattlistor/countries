import { useEffect, useState } from 'react';
import '../css/filter.css';
import '../css/scrollbar.css';
import type { Country } from './App';
import BorderCountryFiltersFlags from './BorderCountryFiltersFlags';
import { getFlagAndCCA3 } from '../utils'

interface BorderCountryFilterProps {
  borderCountryFilters: BorderCountryFilterType[];
  setBorderCountryFilters: React.Dispatch<React.SetStateAction<BorderCountryFilterType[]>>;
}

export type BorderCountryFilterType = {
  name: string;
  flag: string | null;
  cca3: string;
  isLoadingFlag?: boolean;
};

function BorderCountryFilter({
  borderCountryFilters,
  setBorderCountryFilters
}: BorderCountryFilterProps) {
  const [fadingOutFlags, setFadingOutFlags] = useState<Set<string>>(new Set());
  const [borderCountrySearchTerm, setBorderCountrySearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(isLoading);
  const [hasSearched, setHasSearched] = useState(false);
  const [borderCountriesSearchResults, setBorderCountriesSearchResults] = useState<Country[]>([]);
  const [borderCountriesResultsHeight, setBorderCountriesResultsHeight] = useState(0);
  const [showBorderCountryResults, setShowBorderCountryResults] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const removeBorderCountryFilter = (cca3ToRemove: string) => {
    setBorderCountryFilters(prevFilters => {
      return prevFilters.filter(country => country.cca3 !== cca3ToRemove);
    });
  }

  const addToBorderCountryFilters = (countryName: string, flag: string, cca3: string) => {
    setBorderCountryFilters(prevFilters => {
      // Check if the country is already in the filters by comparing CCA3
      if (!prevFilters.some(c => c.cca3 === cca3)) {
        const newList = [...prevFilters, { name: countryName, flag, cca3 }];
        return newList;
      }
      return prevFilters;
    });

    setShowBorderCountryResults(false);
    setBorderCountrySearchTerm('');
  };

  const handleBorderCountryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBorderCountrySearchTerm(event.target.value);
  };

  const handleBorderCountrySearchResultsClick = async (countryName: string) => {
    const flagAndCCA3 = await getFlagAndCCA3(countryName);
    if (flagAndCCA3) {
      addToBorderCountryFilters(countryName, flagAndCCA3[0], flagAndCCA3[1]);
    }
    setBorderCountrySearchTerm('');
  };

  const handleBorderCountryInputFocus = () => {
    setShowBorderCountryResults(true);
  };

  const handleBorderCountryInputBlur = () => {
    setBorderCountriesResultsHeight(0);
    // A small delay to allow click on search results before hiding

    setTimeout(() => {
      setShowBorderCountryResults(false);
    }, 300);
  };

  const handleBorderCountrySearch = async () => {
    // Only fetch if there's a search term or if the input is focused
    if (showBorderCountryResults) {
      try {
        setIsLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Country[] = await response.json();
        const sortedCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        let filtered: Country[] = sortedCountries.filter(country => {
          return country.name.common.toLowerCase().includes(borderCountrySearchTerm.toLowerCase());
        });
        setBorderCountriesSearchResults(filtered);
      } catch (e: unknown) {
        console.error("Error fetching or filtering countries:", e);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    } else {
      setBorderCountriesSearchResults([]); // Clear results if no search term and not focused
      setHasSearched(false);
    }
  };

  useEffect(() => {
    handleBorderCountrySearch();
  }, [borderCountrySearchTerm, showBorderCountryResults]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const transitionDelay = 300;
    const borderCountryResultItemHeight = 44;
    const loaderHeight = 80;

    if (isLoading) {
      setShowLoader(true);
      setBorderCountriesResultsHeight(loaderHeight);
    } else {
      // Allow a brief moment for the loader to show if it was just set to true
      // and then transition to the actual results height
      timer = setTimeout(() => {
        setShowLoader(false);
        if (showBorderCountryResults && hasSearched) {
          if (borderCountriesSearchResults.length > 0) {
            const contentHeight = Math.min((borderCountriesSearchResults.length * borderCountryResultItemHeight), 500);
            setBorderCountriesResultsHeight(contentHeight);
          } else { // No results found
            setBorderCountriesResultsHeight(borderCountryResultItemHeight);
          }
        }
      }, transitionDelay); // Give some time for the loading state to render
    }
    return () => clearTimeout(timer);
  }, [isLoading, borderCountriesSearchResults.length, hasSearched, showBorderCountryResults]);

  const handleRemoveBorderCountryFilterWithAnimation = (cca3ToRemove: string) => {
    setFadingOutFlags((prev) => new Set(prev).add(cca3ToRemove));
    setTimeout(() => {
      removeBorderCountryFilter(cca3ToRemove);
      setFadingOutFlags((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cca3ToRemove);
        return newSet;
      });
    }, 300); // This needs to match the duration of the fade-out animation
  };

  const BorderCountryInput = (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Filter by border countries..."
        className="border-countries-input "
        value={borderCountrySearchTerm}
        onChange={handleBorderCountryInputChange}
        onFocus={handleBorderCountryInputFocus}
        onBlur={handleBorderCountryInputBlur}
      />
    </div>
  );

  let searchResultsContent = null;
  if (showBorderCountryResults) {
    if (isLoading || showLoader) {
      searchResultsContent = (
        <div
          className={`border-countries-search-results container-with-scrollbar ${showLoader || isLoading ? 'is-loading' : ''}`}
          style={{ height: `${borderCountriesResultsHeight}px` }}
        >
          <div className="loader-wheel" />
        </div>
      );
    } else if (borderCountriesSearchResults.length === 0 && hasSearched) {
      searchResultsContent = (
        <div
          className="border-countries-search-results container-with-scrollbar"
          style={{ height: `${borderCountriesResultsHeight}px` }}
        >
          <div className="border-countries-search-result">No results found</div>
        </div>
      );
    } else if (hasSearched) {
      searchResultsContent = (
        <div
          className="border-countries-search-results container-with-scrollbar"
          style={{ height: `${borderCountriesResultsHeight}px` }}
        >
          {borderCountriesSearchResults.map((country: Country, index: number) => (
            <div
              key={index}
              className="border-countries-search-result"
              onMouseDown={() => handleBorderCountrySearchResultsClick(country.name.common)}
            >
              {country.name.common}
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <div className='filter-section-content'>
      <div className={`border-countries-input-container ${borderCountryFilters.length > 0 && 'margin-bottom-20'}`}>
        {BorderCountryInput}
        {searchResultsContent}
      </div>
      <BorderCountryFiltersFlags
        borderCountryFilters={borderCountryFilters}
        removeBorderCountryFilter={handleRemoveBorderCountryFilterWithAnimation}
        fadingOutFlags={fadingOutFlags}
      />
    </div>
  );
}

export default BorderCountryFilter;
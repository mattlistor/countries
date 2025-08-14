import { useEffect, useState } from 'react';
import '../css/filter.css';
import '../css/countrySearch.css';
import '../css/scrollbar.css';
import type { Country } from './App';

interface CountrySearchProps {
  countries: Country[];
  isLoading: boolean;
  initialSearchComplete: boolean;
  searchTerm: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function CountrySearch({
  countries,
  isLoading,
  initialSearchComplete,
}: CountrySearchProps) {
  const [showLoader, setShowLoader] = useState(isLoading);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setShowLoader(true);
    } else {
      timer = setTimeout(() => {
        setShowLoader(false);
      }, 800);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);


  if (isLoading || showLoader) {
    return (
      <div className="search-and-results-container">
        <div className={`results-container container-with-scrollbar ${showLoader || isLoading ? 'is-loading' : ''}`}>
          <div className="loader-wheel" />
        </div>
      </div>
    );
  }

  if (countries.length === 0 && initialSearchComplete) {
    return (
      <div className="search-and-results-container">
        <div className="results-container container-with-scrollbar no-results-found">No results found</div>
      </div>
    );
  }

  return (
    <div className="search-and-results-container">
      <div className="results-container container-with-scrollbar">
        {countries.map((country, index) => (
          <div key={index} className="results-card">
            <a className="results-item" href={`/${country.name.common}`}>
              <div className="result-item-name">{country.name.common}</div>
              <img className="result-item-flag" src={country.flags.png} alt={`${country.name.common} flag`} />
            </a>
          </div>
        ))}
      </div>
    </div >
  );
}

export default CountrySearch;
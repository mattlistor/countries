import { useEffect, useState } from 'react';
import '../css/filter.css';
import '../css/subregions.css';

interface SubregionFilterProps {
  subregionFilters: string[] | undefined;
  setSubregionFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export const subregionList = ['Australia and New Zealand', 'Caribbean', 'Central America', 'Central Asia', 'Central Europe', 'Eastern Africa', 'Eastern Asia', 'Eastern Europe', 'Melanesia', 'Micronesia', 'Middle Africa', 'North America', 'Northern Africa', 'Northern Europe', 'Polynesia', 'South America', 'South-Eastern Asia', 'Southeast Europe', 'Southern Africa', 'Southern Asia', 'Southern Europe', 'Western Africa', 'Western Asia', 'Western Europe'];

function SubregionFilter({ subregionFilters, setSubregionFilters }: SubregionFilterProps) {
  const [subregionSearchTerm, setSubregionSearchTerm] = useState('');
  const [subregionSearchResults, setSubregionSearchResults] = useState<string[]>([]);
  const [subregionResultsHeight, setSubregionResultsHeight] = useState(0);
  const [showSubregionResults, setShowSubregionResults] = useState(false);

  const removeSubregionFilter = (regionToRemove: string) => {
    setSubregionFilters(prevFilters => {
      if (!prevFilters) return prevFilters;
      return prevFilters.filter(region => region !== regionToRemove);
    });
  };

  const addToSubregionFilters = (regionToAdd: string) => {
    setSubregionFilters(prevFilters => {
      // Check if the region is already in the filters
      if (!prevFilters?.some(r => r === regionToAdd)) {
        const newList = [...(prevFilters ?? []), regionToAdd];
        return newList;
      }
      return prevFilters;
    });

    setSubregionResultsHeight(0);
    setShowSubregionResults(false);
    setSubregionSearchTerm('');
  };

  const handleSubregionInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubregionSearchTerm(event.target.value);
  };

  const handleSubregionSearchResultsClick = (region: string) => {
    addToSubregionFilters(region);
    setSubregionSearchTerm('');
  };

  const handleSubregionInputFocus = () => {
    setShowSubregionResults(true);
  };

  const handleSubregionInputBlur = () => {
    setSubregionResultsHeight(0);
    // A small delay to allow click on search results before hiding

    setTimeout(() => {
      setShowSubregionResults(false);
    }, 300);
  };

  const handleSubregionSearch = () => {
    if (showSubregionResults) {
      let filtered: string[] = subregionList.filter(region => {
        return region.toLowerCase().includes(subregionSearchTerm.toLowerCase());
      });
      setSubregionSearchResults(filtered);
    } else {
      setSubregionSearchResults([]); // Clear results if no search term and not focused
    }
  };

  useEffect(() => {
    handleSubregionSearch();
  }, [subregionSearchTerm, showSubregionResults]);

  useEffect(() => {
    const resultItemHeight = 44;
    if (showSubregionResults) {
      if (subregionSearchResults.length > 0) {
        const contentHeight = Math.min((subregionSearchResults.length * resultItemHeight), 500);
        setSubregionResultsHeight(contentHeight);
      } else { // No results found
        setSubregionResultsHeight(resultItemHeight);
      }
    }
  }, [subregionSearchResults.length]);

  const subregionInput = (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Filter by subregion..."
        className="subregions-input"
        value={subregionSearchTerm}
        onChange={handleSubregionInputChange}
        onFocus={handleSubregionInputFocus}
        onBlur={handleSubregionInputBlur}
      />
    </div>
  );

  let searchResultsContent = null;
  if (showSubregionResults) {
    if (subregionSearchResults.length === 0) {
      searchResultsContent = (
        <div
          className="subregions-search-results container-with-scrollbar"
          style={{ height: `${subregionResultsHeight}px` }}
        >
          <div className="subregions-search-result">No results found</div>
        </div>
      );
    } else {
      searchResultsContent = (
        <div
          className="subregions-search-results container-with-scrollbar"
          style={{ height: `${subregionResultsHeight}px` }}
        >
          {subregionSearchResults.map((region: string, index: number) => (
            <div
              key={index}
              className="subregions-search-result"
              onMouseDown={() => handleSubregionSearchResultsClick(region)}
            >
              {region}
            </div>
          ))}
        </div>
      );
    }
  }
  return (
    <div className="filter-section-content">
      <div className={`subregions-input-container ${subregionFilters && subregionFilters.length > 0 && 'margin-bottom-20'}`}>
        {subregionInput}
        {searchResultsContent}
      </div>
      <div className="subregion-pill-container">
        {subregionFilters && subregionFilters.length > 0 ? (
          subregionFilters.map((region, index) => (
            <div className="subregion-pill" key={index}>
              <span className="pill-remove-button" onClick={() => removeSubregionFilter(region)}>&#x2716;</span>
              <div className="subregion-name">{region}</div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}

export default SubregionFilter;
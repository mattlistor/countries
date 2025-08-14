import '../css/filter.css';
import '../css/language.css';
import { useState, useEffect } from 'react';

interface LanguageFilterProps {
  languageFilters: string[] | undefined;
  setLanguageFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export const languageList = ['Australia and New Zealand', 'Caribbean', 'Central America', 'Central Asia', 'Central Europe', 'Eastern Africa', 'Eastern Asia', 'Eastern Europe', 'Melanesia', 'Micronesia', 'Middle Africa', 'North America', 'Northern Africa', 'Northern Europe', 'Polynesia', 'South America', 'South-Eastern Asia', 'Southeast Europe', 'Southern Africa', 'Southern Asia', 'Southern Europe', 'Western Africa', 'Western Asia', 'Western Europe'];

function LanguageFilter({ languageFilters, setLanguageFilters }: LanguageFilterProps) {
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [languageSearchResults, setLanguageSearchResults] = useState<string[]>([]);
  const [languageResultsHeight, setLanguageResultsHeight] = useState(0);
  const [showLanguageResults, setShowLanguageResults] = useState(false);
  const [languageList, setLanguageList] = useState<string[]>([]);


  const getUniqueLanguages = async (): Promise<string[]> => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=languages');
      const data = await response.json();
      const languages = new Set<string>();

      data.forEach((country: any) => {
        if (country.languages) {
          Object.values(country.languages).forEach((language: any) => {
            languages.add(language);
          });
        }
      });
      return Array.from(languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      return [];
    }
  };

  const removeLanguageFilter = (languageToRemove: string) => {
    setLanguageFilters(prev => {
      if (!prev) return prev;
      return prev.filter(language => language !== languageToRemove);
    });
  };

  const addToLanguageFilters = (languageToAdd: string) => {
    setLanguageFilters(prev => {
      if (!prev?.some(r => r === languageToAdd)) {
        const newList = [...(prev ?? []), languageToAdd];
        return newList;
      }
      return prev;
    });

    setLanguageResultsHeight(0);
    setShowLanguageResults(false);
    setLanguageSearchTerm('');
  };

  const handleLanguageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageSearchTerm(event.target.value);
  };

  const handleLanguageSearchResultsClick = (language: string) => {
    addToLanguageFilters(language);
    setLanguageSearchTerm('');
  };

  const handleLanguageInputFocus = () => {
    setShowLanguageResults(true);
  };

  const handleLanguageInputBlur = () => {
    setLanguageResultsHeight(0);
    // A small delay to allow click on search results before hiding

    setTimeout(() => {
      setShowLanguageResults(false);
    }, 300);
  };

  const handleLanguageSearch = () => {
    if (showLanguageResults) {
      let filtered: string[] = languageList.filter(language => {
        return language.toLowerCase().includes(languageSearchTerm.toLowerCase());
      });
      setLanguageSearchResults(filtered);
    } else {
      setLanguageSearchResults([]); // Clear results if no search term and not focused
    }
  };

  useEffect(() => {
    handleLanguageSearch();
  }, [languageSearchTerm, showLanguageResults]);

  useEffect(() => {
    const resultItemHeight = 44;
    if (showLanguageResults) {
      if (languageSearchResults.length > 0) {
        const contentHeight = Math.min((languageSearchResults.length * resultItemHeight), 500);
        setLanguageResultsHeight(contentHeight);
      } else { // No results found
        setLanguageResultsHeight(resultItemHeight);
      }
    }
  }, [languageSearchResults.length]);

  useEffect(() => {
    const fetchLanguages = async () => {
      const languages = await getUniqueLanguages();
      setLanguageList(languages);
    };

    fetchLanguages();
  }, []);

  const languageInput = (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Filter by language..."
        className="language-input"
        value={languageSearchTerm}
        onChange={handleLanguageInputChange}
        onFocus={handleLanguageInputFocus}
        onBlur={handleLanguageInputBlur}
      />
    </div>
  );

  let searchResultsContent = null;
  if (showLanguageResults) {
    if (languageSearchResults.length === 0) {
      searchResultsContent = (
        <div
          className="language-search-results container-with-scrollbar"
          style={{ height: `${languageResultsHeight}px` }}
        >
          <div className="language-search-result">No results found</div>
        </div>
      );
    } else {
      searchResultsContent = (
        <div
          className="language-search-results container-with-scrollbar"
          style={{ height: `${languageResultsHeight}px` }}
        >
          {languageSearchResults.map((language: string, index: number) => (
            <div
              key={index}
              className="language-search-result"
              onMouseDown={() => handleLanguageSearchResultsClick(language)}
            >
              {language}
            </div>
          ))}
        </div>
      );
    }
  }
  return (
    <div className="filter-section-content">
      <div className={`language-input-container ${languageFilters && languageFilters.length > 0 && 'margin-bottom-20'}`}>
        {languageInput}
        {searchResultsContent}
      </div>
      <div className="language-pill-container">
        {languageFilters && languageFilters.length > 0 ? (
          languageFilters.map((language, index) => (
            <div className="language-pill" key={index}>
              <span className="pill-remove-button" onClick={() => removeLanguageFilter(language)}>&#x2716;</span>
              <div className="language-name">{language}</div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}

export default LanguageFilter;
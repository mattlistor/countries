import '../css/filter.css';
import '../css/timezone.css';
import { useState, useEffect } from 'react';

interface TimezoneFilterProps {
  timezoneFilters: string[] | undefined;
  setTimezoneFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export const timezoneList = [
  "UTC",
  "UTC-12:00",
  "UTC-11:00",
  "UTC-10:00",
  "UTC-09:30",
  "UTC-09:00",
  "UTC-08:00",
  "UTC-07:00",
  "UTC-06:00",
  "UTC-05:00",
  "UTC-04:00",
  "UTC-03:30",
  "UTC-03:00",
  "UTC-02:00",
  "UTC-01:00",
  "UTC+00:00",
  "UTC+01:00",
  "UTC+02:00",
  "UTC+03:00",
  "UTC+03:30",
  "UTC+04:00",
  "UTC+04:30",
  "UTC+05:00",
  "UTC+05:30",
  "UTC+05:45",
  "UTC+06:00",
  "UTC+06:30",
  "UTC+07:00",
  "UTC+08:00",
  "UTC+08:45",
  "UTC+09:00",
  "UTC+09:30",
  "UTC+10:00",
  "UTC+10:30",
  "UTC+11:00",
  "UTC+12:00",
  "UTC+12:45",
  "UTC+13:00",
  "UTC+14:00"
];

function TimezoneFilter({ timezoneFilters, setTimezoneFilters }: TimezoneFilterProps) {
  const [timezoneSearchTerm, settimezoneSearchTerm] = useState('');
  const [timezoneSearchResults, settimezoneSearchResults] = useState<string[]>([]);
  const [timezoneResultsHeight, settimezoneResultsHeight] = useState(0);
  const [showTimezoneResults, setShowTimezoneResults] = useState(false);

  const removetimezoneFilter = (timezoneToRemove: string) => {
    setTimezoneFilters(prev => {
      if (!prev) return prev;
      return prev.filter(timezone => timezone !== timezoneToRemove);
    });
  };

  const addTotimezoneFilters = (timezoneToAdd: string) => {
    setTimezoneFilters(prev => {
      if (!prev?.some(r => r === timezoneToAdd)) {
        const newList = [...(prev ?? []), timezoneToAdd];
        return newList;
      }
      return prev;
    });

    settimezoneResultsHeight(0);
    setShowTimezoneResults(false);
    settimezoneSearchTerm('');
  };

  const handletimezoneInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    settimezoneSearchTerm(event.target.value);
  };

  const handletimezoneSearchResultsClick = (timezone: string) => {
    addTotimezoneFilters(timezone);
    settimezoneSearchTerm('');
  };

  const handletimezoneInputFocus = () => {
    setShowTimezoneResults(true);
  };

  const handletimezoneInputBlur = () => {
    settimezoneResultsHeight(0);
    // A small delay to allow click on search results before hiding

    setTimeout(() => {
      setShowTimezoneResults(false);
    }, 300);
  };

  const handletimezoneSearch = () => {
    if (showTimezoneResults) {
      let filtered: string[] = timezoneList.filter(timezone => {
        return timezone.toLowerCase().includes(timezoneSearchTerm.toLowerCase());
      });
      settimezoneSearchResults(filtered);
    } else {
      settimezoneSearchResults([]); // Clear results if no search term and not focused
    }
  };

  useEffect(() => {
    handletimezoneSearch();
  }, [timezoneSearchTerm, showTimezoneResults]);

  useEffect(() => {
    const resultItemHeight = 44;
    if (showTimezoneResults) {
      if (timezoneSearchResults.length > 0) {
        const contentHeight = Math.min((timezoneSearchResults.length * resultItemHeight), 500);
        settimezoneResultsHeight(contentHeight);
      } else { // No results found
        settimezoneResultsHeight(resultItemHeight);
      }
    }
  }, [timezoneSearchResults.length]);

  const timezoneInput = (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Filter by timezone..."
        className="timezone-input"
        value={timezoneSearchTerm}
        onChange={handletimezoneInputChange}
        onFocus={handletimezoneInputFocus}
        onBlur={handletimezoneInputBlur}
      />
    </div>
  );

  let searchResultsContent = null;
  if (showTimezoneResults) {
    if (timezoneSearchResults.length === 0) {
      searchResultsContent = (
        <div
          className="timezone-search-results container-with-scrollbar"
          style={{ height: `${timezoneResultsHeight}px` }}
        >
          <div className="timezone-search-result">No results found</div>
        </div>
      );
    } else {
      searchResultsContent = (
        <div
          className="timezone-search-results container-with-scrollbar"
          style={{ height: `${timezoneResultsHeight}px` }}
        >
          {timezoneSearchResults.map((timezone: string, index: number) => (
            <div
              key={index}
              className="timezone-search-result"
              onMouseDown={() => handletimezoneSearchResultsClick(timezone)}
            >
              {timezone}
            </div>
          ))}
        </div>
      );
    }
  }
  return (
    <div className="filter-section-content">
      <div className={`timezone-input-container ${timezoneFilters && timezoneFilters.length > 0 && 'margin-bottom-20'}`}>
        {timezoneInput}
        {searchResultsContent}
      </div>
      <div className="timezone-pill-container">
        {timezoneFilters && timezoneFilters.length > 0 ? (
          timezoneFilters.map((timezone, index) => (
            <div className="timezone-pill" key={index}>
              <span className="pill-remove-button" onClick={() => removetimezoneFilter(timezone)}>&#x2716;</span>
              <div className="timezone-name">{timezone}</div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}

export default TimezoneFilter;
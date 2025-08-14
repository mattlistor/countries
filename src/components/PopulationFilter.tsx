import '../css/populationFilter.css';
import React, { useState } from 'react';



interface PopulationFilterProps {
  populationFilters: (number | null)[];
  setPopulationFilters: React.Dispatch<React.SetStateAction<(number | null)[]>>;
}

const allPopulationFilterOptions = [
  0,
  100000,     // 0.1 million
  200000,     // 0.2 million
  300000,     // 0.3 million
  400000,     // 0.4 million
  500000,     // 0.5 million
  1000000,    // 1 million
  5000000,    // 5 million
  10000000,   // 10 million
  25000000,   // 25 million
  50000000,   // 50 million
  100000000,  // 100 million
  250000000,  // 250 million
  500000000,  // 500 million
  1000000000, // 1 billion
  1500000000, // 1.5 billion
];

function PopulationFilter({ populationFilters, setPopulationFilters }: PopulationFilterProps) {
  const [expanded, setExpanded] = useState(true);


  const handlePopulationMinChange = (value: string) => {
    const minPop = value === '' ? null : Number(value);
    setPopulationFilters([minPop, populationFilters[1]]);

    // If current max is less than new min, reset max to null
    if (populationFilters[1] !== null && minPop !== null && populationFilters[1] < minPop) {
      setPopulationFilters([minPop, null]);
    }
  };

  const handlePopulationMaxChange = (value: string) => {
    const maxPop = value === '' ? null : Number(value);
    setPopulationFilters([populationFilters[0], maxPop]);
  };

  // Filter options for the "Max" select
  const filteredMaxOptions = allPopulationFilterOptions.filter(pop => {
    const minPop = populationFilters[0];
    return minPop === null || pop > minPop;
  });

  return (
    <div className="filter-section-content population-select-container population-filter">
      <div className="select-wrapper">
        <select
          id="population-min-select"
          value={populationFilters[0] === null ? '' : populationFilters[0]}
          onChange={(e) => handlePopulationMinChange(e.target.value)}
        >
          <option value="">
            No Min
          </option>
          {allPopulationFilterOptions.map((pop: number, index) => (
            <option key={`min-${index}`} value={pop}>
              {pop.toLocaleString()}
            </option>
          ))}
        </select>
      </div>
      <span className="population-select-separator">-</span>
      <div className="select-wrapper">
        <select
          id="population-max-select"
          value={populationFilters[1] === null ? '' : populationFilters[1]}
          onChange={(e) => handlePopulationMaxChange(e.target.value)}
        >
          <option value="">
            No Max
          </option>
          {filteredMaxOptions.map((pop: number, index) => (
            <option key={`max-${index}`} value={pop}>
              {pop.toLocaleString()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default PopulationFilter;
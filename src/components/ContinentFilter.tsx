import '../css/filter.css';
import '../css/checkboxes.css';
import ChevronDown from './ChevronDown';

interface ContinentFilterProps {
  continentFilters: ContinentFilterType;
  handleContinentChange: (regionName: string) => void;
}

export type ContinentFilterType = {
  [key: string]: boolean;
};

export const continentList: string[] = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

function ContinentFilter({ continentFilters, handleContinentChange }: ContinentFilterProps) {


  const pills = continentList.map((region, index) => {
    return (
      <div
        className={`region-pill-item pill-item${continentFilters[region] === true ? ' selected' : ''}`}
        key={index}
        onClick={() => handleContinentChange(region)}
      >

        <div className="region-name pill-name">{region}</div>
      </div>
    );
  });

  return (
    <div className="filter-section-content pill-container">
      {pills}
    </div>
  );
}

export default ContinentFilter;
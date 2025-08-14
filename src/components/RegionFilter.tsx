import '../css/filter.css';
import '../css/pills.css';

interface RegionFilterProps {
  regionFilters: RegionFilterType;
  handleRegionChange: (regionName: string) => void;
}

export type RegionFilterType = {
  [key: string]: boolean;
};

export const regionList: string[] = ["Africa", "Americas", "Antarctic", "Asia", "Europe", "Oceania"];

function RegionFilter({ regionFilters, handleRegionChange }: RegionFilterProps) {

  const pills = regionList.map((region, index) => {
    return (
      <div
        className={`region-pill-item pill-item${regionFilters[region] === true ? ' selected' : ''}`}
        key={index}
        onClick={() => handleRegionChange(region)}
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

export default RegionFilter;
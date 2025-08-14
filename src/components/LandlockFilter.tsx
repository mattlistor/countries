import '../css/filter.css';
import '../css/checkboxes.css';

import { useState, type ChangeEvent } from 'react';

interface LandlockFilterProps {
  landlockFilter: LandlockFilterType;
  handleLandlockTrueChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleLandlockFalseChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type LandlockFilterType = 'all' | 'landlocked' | 'notLandlocked';

function LandlockFilter({ landlockFilter, handleLandlockTrueChange, handleLandlockFalseChange }: LandlockFilterProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
    <div className="filter-section-content checkboxes-container">
      <div className="checkbox-container">
        <input
          checked={landlockFilter === 'all' || landlockFilter === 'landlocked'}
          type="checkbox"
          id="landlock-true-checkbox"
          name="landlock-true-checkbox"
          onChange={handleLandlockTrueChange}
          className="hidden-checkbox"
        />
        <label htmlFor="landlock-true-checkbox">
          <span className="custom-checkbox"></span>
          Yes
        </label>
      </div>
      <div className="checkbox-container">
        <input
          checked={landlockFilter === 'all' || landlockFilter === 'notLandlocked'}
          type="checkbox"
          id="landlock-false-checkbox"
          name="landlock-false-checkbox"
          onChange={handleLandlockFalseChange}
          className="hidden-checkbox"
        />
        <label htmlFor="landlock-false-checkbox">
          <span className="custom-checkbox"></span>
          No
        </label>
      </div>
    </div>
  );
}

export default LandlockFilter;
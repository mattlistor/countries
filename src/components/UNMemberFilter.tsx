import { ChangeEvent, useState } from 'react';
import '../css/filter.css';
import '../css/checkboxes.css';

interface UNMemberFilterProps {
  UNMemberFilter: UNMemberFilterType,
  handleUNMemberTrueChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleUNMemberFalseChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type UNMemberFilterType = 'all' | 'member' | 'notMember';

export const regionList: string[] = ["Africa", "Americas", "Antarctic", "Asia", "Europe", "Oceania"];

function UNMemberFilter({ UNMemberFilter, handleUNMemberTrueChange, handleUNMemberFalseChange }: UNMemberFilterProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="filter-section-content checkboxes-container">
      <div className="checkbox-container">
        <input
          checked={UNMemberFilter === 'all' || UNMemberFilter === 'member'}
          type="checkbox"
          id="unmember-true-checkbox"
          name="unmember-true-checkbox"
          onChange={handleUNMemberTrueChange}
          className="hidden-checkbox"
        />
        <label htmlFor="unmember-true-checkbox">
          <span className="custom-checkbox"></span>
          Yes
        </label>
      </div>
      <div className="checkbox-container">
        <input
          checked={UNMemberFilter === 'all' || UNMemberFilter === 'notMember'}
          type="checkbox"
          id="unmember-false-checkbox"
          name="unmember-false-checkbox"
          onChange={handleUNMemberFalseChange}
          className="hidden-checkbox"
        />
        <label htmlFor="unmember-false-checkbox">
          <span className="custom-checkbox"></span>
          No
        </label>
      </div>
    </div>
  );
}

export default UNMemberFilter;
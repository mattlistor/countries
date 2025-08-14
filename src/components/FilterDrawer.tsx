import '../css/filter.css';
import '../css/checkboxes.css';
import ChevronDown from './ChevronDown';


interface FilterDrawerProps {
  isExpanded: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
}

function FilterDrawer({ title, children, isExpanded, onToggle }: FilterDrawerProps) {
  return (
    <div className={`filter-section ${isExpanded ? ' expanded' : ''}`}>
      <div className="filter-section-title" onClick={onToggle}>
        <p className="filter-section-title-text">{title}</p>
        <div className="chevron-down-icon"><ChevronDown /></div>
      </div>
      {children}
    </div>
  );
}

export default FilterDrawer;
import { JSX, useEffect, useRef, useState } from 'react';
import '../css/filter.css';
import ChevronDown from './ChevronDown';
import FilterPill from './FilterPill';



interface FilterPillsContainerProps {
  filterPills: JSX.Element[];
  expandCollapseButton: JSX.Element;
  clearFilters: () => void;
  

}

function FilterPillsContainer({ filterPills, expandCollapseButton, clearFilters }: FilterPillsContainerProps) {

  const pillsContainerRef = useRef<HTMLSpanElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const scrollPills = (scrollOffset: number) => {
    if (pillsContainerRef.current) {
      pillsContainerRef.current.scrollLeft += scrollOffset;
    }
  };

  const checkForOverflow = () => {
    if (pillsContainerRef.current) {
      const { scrollWidth, clientWidth } = pillsContainerRef.current;
      setShowArrows(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkForOverflow();
    window.addEventListener('resize', checkForOverflow);
    return () => window.removeEventListener('resize', checkForOverflow);
  }, [filterPills]);


  return <div className="filter-buttons-and-pills-container">
    <span className="filter-header-buttons-container">
      <span className="filter-header-button" onClick={() => {clearFilters(); setShowArrows(false)}}>
        Clear Filters
      </span>
      {expandCollapseButton}
    </span>
    <span className="filter-pills-wrapper">
      {showArrows &&
        <span className="scroll-arrow scroll-arrow-left" onClick={() => scrollPills(-200)}>
          <ChevronDown />
        </span>}
      <span className="filter-pills-container" ref={pillsContainerRef}>
        {filterPills}
      </span>
      {showArrows &&
        <span className="scroll-arrow scroll-arrow-right" onClick={() => scrollPills(200)}>
          <ChevronDown />
        </span>}
    </span>
  </div>;
}

export default FilterPillsContainer;


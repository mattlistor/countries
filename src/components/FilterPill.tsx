import '../css/filter.css';
import '../css/checkboxes.css';


interface FilterPillProps {
  filterComponent: {
    title: string,
    pillText: string
  },
  clearFilter: (filterTitle: string) => void,
}

function FilterPill({ filterComponent,  clearFilter }: FilterPillProps) {
  const { title, pillText } = filterComponent;

  if (!pillText) {
    return <></>;
  }

  const noTooltip = ["UN Member", "Landlocked", "Population"].includes(title);

  const pillContent = (
    <>
      <span className="filter-pill-clear-button" onClick={() => clearFilter(title)}>&#x2716;</span>
      <span className="filter-pill-title">{noTooltip ? pillText : title}</span>
    </>
  );

  return (
    <div className={`filter-pill-wrapper${noTooltip ? '' : ' has-tooltip'}`} data-tooltip={!noTooltip ? pillText : undefined}>
      <div className="filter-pill">
        {pillContent}
      </div>
    </div>
  );
}

export default FilterPill;


import { BorderCountryFilterType } from './components/BorderCountryFilter';
import { RegionFilterType, regionList } from './components/RegionFilter';
import type { Country } from './components/App';
import { ContinentFilterType, continentList } from './components/ContinentFilter';

type flagAndCCA3 = [string, string];

export function getLandLockFilterFromURI() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryLandlockFilter = urlParams.get('landlocked')?.toLowerCase();

  // If queryLandlockFilter is not present, default to 'all'
  if (queryLandlockFilter === 'false') {
    return 'notLandlocked';
  } else if (queryLandlockFilter === 'true') {
    return 'landlocked';
  }
  return 'all';
}

export function getUNMemberFilterFromURI() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryUNMemberFilter = urlParams.get('UNMember')?.toLowerCase();

  // If queryUNMemberFilter is not present, default to 'all'
  if (queryUNMemberFilter === 'false') {
    return 'notMember';
  } else if (queryUNMemberFilter === 'true') {
    return 'member';
  }
  return 'all';
}

export function getQParamFilterFromURI() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const querySearchTerm = urlParams.get('q');
  if (querySearchTerm) {
    return querySearchTerm;
  }
}

export function getFilterFromURI(filterName: string): string[] {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const queryFilter = urlParams.get(filterName);
  if (queryFilter) {
    return queryFilter.split(',');
  }
  return [];
}

export function getRegionFilterFromURI() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString)

  const queryRegions = urlParams.get('regions');
  if (queryRegions) {
    const selectedRegionsFromUri = queryRegions.split(',');
    const newRegionStates: RegionFilterType = {};
    regionList.forEach(region => {
      newRegionStates[region] = selectedRegionsFromUri.includes(region);
    });
    return newRegionStates;
  } else {
    const initialState: RegionFilterType = {};
    regionList.forEach(region => {
      initialState[region] = false;
    });
    return initialState;
  }
}

export function getContinentFilterFromURI() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString)

  const queryContinents = urlParams.get('continents');
  if (queryContinents) {
    const selectedContinentsFromUri = queryContinents.split(',');
    const newContinentStates: ContinentFilterType = {};
    continentList.forEach(continent => {
      newContinentStates[continent] = selectedContinentsFromUri.includes(continent);
    });
    return newContinentStates;
  } else {
    const initialState: ContinentFilterType = {};
    continentList.forEach(continent => {
      initialState[continent] = false;
    });
    return initialState;
  }
}

export function getPopulationFilterFromURI() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const queryPopulationFilter = urlParams.get('population');
  if (queryPopulationFilter === null || queryPopulationFilter.trim() === '') {
    return [null, null];
  }

  try {
    // Remove brackets and split by comma
    const cleanedString = queryPopulationFilter.replace(/[\[\]]/g, '');
    const minAndMax = cleanedString.split(',').map(part => part.trim());

    if (minAndMax.length === 2) {
      const min = minAndMax[0] === 'null' ? null : parseFloat(minAndMax[0]);
      const max = minAndMax[1] === 'null' ? null : parseFloat(minAndMax[1]);

      // Validate that if a value is not null, it's a valid number
      const minIsValid = min === null || !isNaN(min);
      const maxIsValid = max === null || !isNaN(max);

      if (minIsValid && maxIsValid) {
        return [min, max];
      }
    }
  } catch (error) {
    console.error("Error parsing population filter:", error);
    // Fall through to return [null, null]
  }

  // If parsing fails or format is incorrect, return [null, null]
  return [null, null];
}

export async function getFlagAndCCA3(countryName: string): Promise<flagAndCCA3 | null> {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true&fields=flags,cca3`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Country[] = await response.json();
    // Ensure data[0].flags.png and data[0].cca3 exist before returning
    if (data && data.length > 0 && data[0].flags && data[0].flags.png && data[0].cca3) {
      return [data[0].flags.png, data[0].cca3];
    }
    return null;
  } catch (e: unknown) {
    console.error("Error fetching flag:", e);
    return null;
  }
};

export async function getBorderCountryQueryFromUri(
  setBorderCountryFilters: React.Dispatch<React.SetStateAction<BorderCountryFilterType[]>>,
): Promise<void> {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString)

  const borderCountryNamesFromUri: string[] = [];
  let i = 0;
  while (urlParams.has(`borderCountries[${i}]`)) {
    const countryName = urlParams.get(`borderCountries[${i}]`);
    if (countryName) {
      borderCountryNamesFromUri.push(countryName);
    }
    i++;
  }

  // Initialize filters with loading state
  const initialBorderCountryFilters: BorderCountryFilterType[] = borderCountryNamesFromUri.map(name => ({
    name: name,
    flag: null,
    cca3: '',
    isLoadingFlag: true,
  }));

  // Update the state immediately so placeholders show
  setBorderCountryFilters(initialBorderCountryFilters);

  const updatedBorderCountryFilters: BorderCountryFilterType[] = [...initialBorderCountryFilters]; // Create a mutable copy

  for (let j = 0; j < borderCountryNamesFromUri.length; j++) {
    const countryName = borderCountryNamesFromUri[j];
    const flagAndCCA3 = await getFlagAndCCA3(countryName);
    if (flagAndCCA3) {
      updatedBorderCountryFilters[j] = {
        ...updatedBorderCountryFilters[j],
        flag: flagAndCCA3[0],
        cca3: flagAndCCA3[1],
        isLoadingFlag: false,
      };
    } else {
      updatedBorderCountryFilters[j] = {
        ...updatedBorderCountryFilters[j],
        isLoadingFlag: false,

      };
    }
  }
  // Update state when *all* flags are loaded
  // Create a new array reference to trigger re-render
  setBorderCountryFilters([...updatedBorderCountryFilters]);
}

export function getBorderCountryPillText(
  borderCountryFilters: BorderCountryFilterType[],
): string {
  return borderCountryFilters.length > 0 ? borderCountryFilters.map((c => c.name)).join(', ') : '';
};

export function getPopulationPillText(
  populationFilters: (number | null)[],
): string {
  const [min, max] = populationFilters;

  // Handles the case where both min and max are null
  if (min === null && max === null) {
    return '';
  }

  function formatPopulation(value: number): string {
    if (value >= 1_000_000_000) {
      const formatted = (value / 1_000_000_000);
      return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      const formatted = (value / 1_000_000);
      return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}M`;
    }
    if (value >= 1_000) {
      const formatted = (value / 1_000);
      return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}K`;
    }
    return value.toLocaleString();
  }

  if (min === null) {
    return `Population: Up to ${formatPopulation(max as number)}`;
  }

  if (max === null) {
    return `Population: ${formatPopulation(min as number)}+`;
  }
  
  return `Population: ${formatPopulation(min)} to ${formatPopulation(max)}`;
}

export function getContinentPillText(
  continentFilters: ContinentFilterType): string {
  const allFalseState: ContinentFilterType = {};
  continentList.forEach(continent => {
    allFalseState[continent] = false;
  });
  if (continentFilters === allFalseState) {
    return '';
  }
  const selectedContinentNames = Object.keys(continentFilters).filter(continent => continentFilters[continent]);
  return selectedContinentNames.join(', ');
}

export function getRegionPillText(
  regionFilters: RegionFilterType): string {
  const allFalseState: RegionFilterType = {};
  regionList.forEach(region => {
    allFalseState[region] = false;
  });
  if (regionFilters === allFalseState) {
    return '';
  }
  const selectedRegionNames = Object.keys(regionFilters).filter(region => regionFilters[region]);
  return selectedRegionNames.join(', ');
}


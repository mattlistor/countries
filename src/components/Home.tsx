import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../css/filter.css';
import type { Country } from './App';

import RegionFilter, { RegionFilterType, regionList } from './RegionFilter';
import ContinentFilter, { ContinentFilterType, continentList } from './ContinentFilter';
import UNMemberFilter, { UNMemberFilterType } from './UNMemberFilter';
import LandlockFilter, { LandlockFilterType } from './LandlockFilter';
import BorderCountryFilter, { BorderCountryFilterType } from './BorderCountryFilter';
import CountrySearch from './CountrySearch';
import PopulationFilter from './PopulationFilter';
import SubregionFilter from './SubregionFilter';
import TimezoneFilter from './TimezoneFilter';
import LanguageFilter from './LanguageFilter';
import FilterDrawer from './FilterDrawer';
import FilterPill from './FilterPill';
import FilterPillsContainer from './FilterPillsContainer';

import {
  getBorderCountryQueryFromUri,
  getLandLockFilterFromURI,
  getUNMemberFilterFromURI,
  getQParamFilterFromURI,
  getRegionFilterFromURI,
  getPopulationFilterFromURI,
  getContinentFilterFromURI,
  getFilterFromURI,
  getBorderCountryPillText,
  getPopulationPillText,
  getContinentPillText,
  getRegionPillText,
} from '../utils';

function Home() {
  const [searchTerm, setSearchTerm] = useState(() => { return getQParamFilterFromURI() || ''; });
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialSearchComplete, setInitialSearchComplete] = useState(false);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [landlockFilter, setLandlockFilter] = useState<LandlockFilterType>(() => { return getLandLockFilterFromURI(); });
  const [unMemberFilter, setUnMemberFilter] = useState<UNMemberFilterType>(() => { return getUNMemberFilterFromURI(); });
  const [borderCountryFilters, setBorderCountryFilters] = useState<BorderCountryFilterType[]>([]);
  const [regionFilters, setRegionFilters] = useState<RegionFilterType>(() => { return getRegionFilterFromURI(); });
  const [continentFilters, setContinentFilters] = useState<ContinentFilterType>(() => { return getContinentFilterFromURI(); });
  const [populationFilters, setPopulationFilters] = useState<(number | null)[]>(() => { return getPopulationFilterFromURI(); });
  const [subregionFilters, setSubregionFilters] = useState<string[]>(() => { return getFilterFromURI('subregions'); });
  const [languageFilters, setLanguageFilters] = useState<string[]>(() => { return getFilterFromURI('languages'); });
  const [timezoneFilters, setTimezoneFilters] = useState<string[]>(() => { return getFilterFromURI('timezones'); });
  const MOBILE_BREAKPOINT = 650;
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const setNewURL = () => {
    const newUrl = new URL(window.location.pathname, window.location.origin);

    // Set q
    if (searchTerm) {
      newUrl.searchParams.set('q', searchTerm);
    } else {
      newUrl.searchParams.delete('q');
    }

    // Set landlocked
    if (landlockFilter === 'landlocked') {
      newUrl.searchParams.set('landlocked', 'true');
    } else if (landlockFilter === 'notLandlocked') {
      newUrl.searchParams.set('landlocked', 'false');
    } else {
      newUrl.searchParams.delete('landlocked');
    }

    // Set borderCountries
    if (borderCountryFilters.length > 0) {
      for (let i = 0; i < borderCountryFilters.length; i++) {
        newUrl.searchParams.append('borderCountries[' + i + ']', borderCountryFilters[i].name);
      }
    } else {
      let i = 0;
      while (newUrl.searchParams.has(`borderCountries[${i}]`)) {
        newUrl.searchParams.delete(`borderCountries[${i}]`);
        i++;
      }
    }

    // Set regions
    const selectedRegionNames = Object.keys(regionFilters).filter(region => regionFilters[region]);
    if (selectedRegionNames.length > 0 && selectedRegionNames.length < regionList.length) {
      newUrl.searchParams.set('regions', selectedRegionNames.join(','));
    } else {
      newUrl.searchParams.delete('regions');
    }

    // Set subregions
    if (subregionFilters && subregionFilters.length > 0) {
      newUrl.searchParams.set('subregions', subregionFilters.join(','));
    } else {
      newUrl.searchParams.delete('subregions');
    }

    // Set languages
    if (languageFilters && languageFilters.length > 0) {
      newUrl.searchParams.set('languages', languageFilters.join(','));
    } else {
      newUrl.searchParams.delete('languages');
    }

    // Set timezones
    if (timezoneFilters && timezoneFilters.length > 0) {
      newUrl.searchParams.set('timezones', timezoneFilters.join(','));
    } else {
      newUrl.searchParams.delete('timezones');
    }

    // Set continents
    const selectedContinentNames = Object.keys(continentFilters).filter(continent => continentFilters[continent]);
    if (selectedContinentNames.length > 0 && selectedContinentNames.length < continentList.length) {
      newUrl.searchParams.set('continents', selectedContinentNames.join(','));
    } else {
      newUrl.searchParams.delete('continents');
    }

    // Set unMember
    if (unMemberFilter === 'member') {
      newUrl.searchParams.set('UNMember', 'true');
    } else if (unMemberFilter === 'notMember') {
      newUrl.searchParams.set('UNMember', 'false');
    } else {
      newUrl.searchParams.delete('UNMember');
    }

    // Set population
    if (populationFilters[0] !== null || populationFilters[1] !== null) {
      newUrl.searchParams.set('population', JSON.stringify(populationFilters));
    }

    window.history.pushState({ path: newUrl.href }, '', newUrl.href);
  }

  const filteredCountries = useMemo(() => {
    if (!allCountries.length) {
      return [];
    }

    const filters = [
      // Filter by searchTerm
      (country: Country) => country.name.common.toLowerCase().includes(searchTerm.toLowerCase()),

      // Filter by landlock value
      (country: Country) => {
        if (landlockFilter === 'landlocked') return country.landlocked;
        if (landlockFilter === 'notLandlocked') return !country.landlocked;
        return true;
      },

      // Filter by borderCountryFilters
      (country: Country) => {
        if (borderCountryFilters.length === 0) return true;
        if (!country.borders) return false;
        const borderCCA3s = borderCountryFilters.map(filter => filter.cca3);
        return country.borders.some(border => borderCCA3s.includes(border));
      },

      // Filter by regionFilters
      (country: Country) => {
        const selectedRegions = Object.keys(regionFilters).filter(region => regionFilters[region]);
        if (selectedRegions.length === 0 || selectedRegions.length === regionList.length) {
          return true;
        }
        return country.region && selectedRegions.includes(country.region);
      },

      // Filter by subregions
      (country: Country) => {
        if (subregionFilters.length === 0) return true;
        return country.subregion && subregionFilters.includes(country.subregion);
      },

      // Filter by languages
      (country: Country) => {
        if (languageFilters.length === 0) return true;
        if (!country.languages) return false;
        const countryLanguages = Object.values(country.languages);
        return languageFilters.some(filterLang => countryLanguages.includes(filterLang));
      },

      // Filter by timezoneFilters
      (country: Country) => {
        if (timezoneFilters.length === 0) return true;
        if (!country.timezones) return false;
        const countryTimezone = Object.values(country.timezones);
        return timezoneFilters.some(timezone => countryTimezone.includes(timezone));
      },

      // Filter by continentFilters
      (country: Country) => {
        const selectedContinents = Object.keys(continentFilters).filter(continent => continentFilters[continent]);
        if (selectedContinents.length === 0 || selectedContinents.length === continentList.length) {
          return true;
        }
        return country.continents && country.continents.some(continent => selectedContinents.includes(continent));
      },

      // Filter by unMemberFilter
      (country: Country) => {
        if (unMemberFilter === 'member') return country.unMember;
        if (unMemberFilter === 'notMember') return !country.unMember;
        return true;
      },

      // Filter by populationFilters
      (country: Country) => {
        const [min, max] = populationFilters;
        const population = country.population;
        return (!min || population >= min) && (!max || population <= max);
      },
    ];

    const result = filters.reduce((currentCountries, filterFn) => {
      return currentCountries.filter(filterFn);
    }, allCountries);

    setNewURL();

    return result;
  }, [
    allCountries,
    searchTerm,
    landlockFilter,
    borderCountryFilters,
    regionFilters,
    subregionFilters,
    languageFilters,
    timezoneFilters,
    continentFilters,
    unMemberFilter,
    populationFilters,
  ]);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleLandlockTrueChange = useCallback(() => {
    setLandlockFilter(prev =>
      prev === 'landlocked' || prev === 'all' ? 'notLandlocked' : 'all'
    );
  }, []);

  const handleLandlockFalseChange = useCallback(() => {
    setLandlockFilter(prev =>
      prev === 'notLandlocked' || prev === 'all' ? 'landlocked' : 'all'
    );
  }, []);

  const handleUNMemberTrueChange = useCallback(() => {
    setUnMemberFilter(prev =>
      prev === 'member' || prev === 'all' ? 'notMember' : 'all'
    );
  }, []);

  const handleUNMemberFalseChange = useCallback(() => {
    setUnMemberFilter(prev =>
      prev === 'notMember' || prev === 'all' ? 'member' : 'all'
    );
  }, []);

  const handleSearch = async () => {
    try {
      setSearchLoading(true);

      // Define the fields we need from the API
      const fields1 = 'name,landlocked,borders,flags,cca3,region,languages,population,continents,subregion';
      const fields2 = 'unMember,timezones';

      // Combine the fetch requests into a single promise.all
      const [response1, response2] = await Promise.all([
        fetch(`https://restcountries.com/v3.1/all?fields=${fields1}`),
        fetch(`https://restcountries.com/v3.1/all?fields=cca3,${fields2}`)
      ]);

      if (!response1.ok || !response2.ok) {
        const errorStatus = response1.ok ? response2.status : response1.status;
        throw new Error(`HTTP error! status: ${errorStatus}`);
      }

      const countriesData: Country[] = await response1.json();
      const unMemberAndTimezoneData: { cca3: string; unMember: boolean; timezones: string[] }[] = await response2.json();

      const additionalDataMap = unMemberAndTimezoneData.reduce<{
        [key: string]: { unMember: boolean; timezones: string[] };
      }>((acc, country) => {
        acc[country.cca3] = {
          unMember: country.unMember,
          timezones: country.timezones,
        };
        return acc;
      }, {});

      // Merge the data more cleanly
      const mergedCountries = countriesData.map(country => {
        const additionalData = additionalDataMap[country.cca3];
        return {
          ...country,
          unMember: additionalData?.unMember ?? false,
          timezones: additionalData?.timezones ?? [],
        };
      });

      const sortedCountries = mergedCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      setAllCountries(sortedCountries);
    } catch (e: unknown) {
      console.error("Error fetching or filtering countries:", e);
    }
    finally {
      setSearchLoading(false);
      setInitialSearchComplete(true);
    }
  };

  const handleRegionChange = (regionName: string) => {
    setRegionFilters(prevState => {
      return {
        ...prevState,
        [regionName]: !prevState[regionName]
      };;
    });
  };

  const handleContinentChange = (continentName: string) => {
    setContinentFilters(prevState => {
      return {
        ...prevState,
        [continentName]: !prevState[continentName]
      };
    });
  };

  useEffect(() => {
    getBorderCountryQueryFromUri(setBorderCountryFilters);
    handleSearch(); // Initial search on component mount

    const initialExpandedState = filterConfigs.reduce<{ [key: string]: boolean }>((acc, config) => {
      acc[config.title] = true;
      return acc;
    }, {});
    setExpandedDrawers(initialExpandedState);

    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(isMobile);
      if (!isMobile) {
        setShowMobileFilters(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const filterConfigs = [
    {
      title: 'Border Countries',
      filter: borderCountryFilters,
      pillText: getBorderCountryPillText(borderCountryFilters),
      component: (
        <BorderCountryFilter
          borderCountryFilters={borderCountryFilters}
          setBorderCountryFilters={setBorderCountryFilters}
        />
      ),
    },
    {
      title: 'Timezones',
      filter: timezoneFilters,
      pillText: timezoneFilters.join(','),
      component: (
        <TimezoneFilter
          timezoneFilters={timezoneFilters}
          setTimezoneFilters={setTimezoneFilters}
        />
      ),
    },
    {
      title: 'Languages',
      filter: languageFilters,
      pillText: languageFilters.join(', '),
      component: (
        <LanguageFilter
          languageFilters={languageFilters}
          setLanguageFilters={setLanguageFilters}
        />
      ),
    },
    {
      title: 'Continents',
      filter: continentFilters,
      pillText: getContinentPillText(continentFilters),
      component: (
        <ContinentFilter
          continentFilters={continentFilters}
          handleContinentChange={handleContinentChange}
        />
      ),
    },
    {
      title: 'Regions',
      filter: regionFilters,
      pillText: getRegionPillText(regionFilters),
      component: (
        <RegionFilter
          regionFilters={regionFilters}
          handleRegionChange={handleRegionChange}
        />
      ),
    },
    {
      title: 'Subregions',
      filter: subregionFilters,
      pillText: subregionFilters.join(', '),
      component: (
        <SubregionFilter
          subregionFilters={subregionFilters}
          setSubregionFilters={setSubregionFilters}
        />
      ),
    },
    {
      title: 'Population',
      filter: populationFilters,
      pillText: getPopulationPillText(populationFilters),
      component: (
        <PopulationFilter
          populationFilters={populationFilters}
          setPopulationFilters={setPopulationFilters}
        />
      ),
    },
    {
      title: 'Landlocked',
      filter: landlockFilter,
      pillText: landlockFilter === 'landlocked' ? 'Landlocked' : (landlockFilter === 'notLandlocked' ? 'Not Landlocked' : ''),
      component: (
        <LandlockFilter
          landlockFilter={landlockFilter}
          handleLandlockTrueChange={handleLandlockTrueChange}
          handleLandlockFalseChange={handleLandlockFalseChange}
        />
      ),
    },
    {
      title: 'UN Member',
      filter: unMemberFilter,
      pillText: unMemberFilter === 'member' ? 'UN Member' : (unMemberFilter === 'notMember' ? 'Not UN Member' : ''),
      component: (
        <UNMemberFilter
          UNMemberFilter={unMemberFilter}
          handleUNMemberTrueChange={handleUNMemberTrueChange}
          handleUNMemberFalseChange={handleUNMemberFalseChange}
        />
      ),
    },
  ];

  const [expandedDrawers, setExpandedDrawers] = useState(() => {
    return filterConfigs.reduce<{ [key: string]: boolean }>((acc, config) => {
      acc[config.title] = true;
      return acc;
    }, {});
  });

  const handleToggleDrawer = (title: string) => {
    setExpandedDrawers(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const collapseAllDrawers = () => {
    const allCollapsedState = Object.keys(expandedDrawers).reduce<{ [key: string]: boolean }>((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    setExpandedDrawers(allCollapsedState);
  };

  const expandAllDrawers = () => {
    const allExpandededState = Object.keys(expandedDrawers).reduce<{ [key: string]: boolean }>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setExpandedDrawers(allExpandededState);
  };

  const allDrawersCollapsed = Object.values(expandedDrawers).every(expanded => !expanded);

  const clearFilters = () => {
    setRegionFilters(() => {
      const allTrueState: RegionFilterType = {};
      regionList.forEach(region => { allTrueState[region] = false; });
      return allTrueState;
    });
    setContinentFilters(() => {
      const allTrueState: ContinentFilterType = {};
      continentList.forEach(continent => { allTrueState[continent] = false; });
      return allTrueState;
    });
    setLandlockFilter('all');
    setUnMemberFilter('all');
    setBorderCountryFilters([]);
    setSubregionFilters([]);
    setLanguageFilters([]);
    setTimezoneFilters([]);
    setPopulationFilters([null, null]);
    setSearchTerm('');
  }

  const clearFilter = (filterTitle: string) => {
    switch (filterTitle) {
      case 'Regions':
        setRegionFilters(() => {
          const allFalseState: RegionFilterType = {};
          regionList.forEach(region => { allFalseState[region] = false; });
          return allFalseState;
        });
        break;
      case 'Continents':
        setContinentFilters(() => {
          const allFalseState: ContinentFilterType = {};
          continentList.forEach(continent => { allFalseState[continent] = false; });
          return allFalseState;
        });
        break;
      case 'Border Countries':
        setBorderCountryFilters([]);
        break;
      case 'Landlocked':
        setLandlockFilter('all');
        break;
      case 'UN Member':
        setUnMemberFilter('all');
        break;
      case 'Subregions':
        setSubregionFilters([]);
        break;
      case 'Languages':
        setLanguageFilters([]);
        break;
      case 'Population':
        setPopulationFilters([null, null]);
        break;
      case 'Timezones':
        setTimezoneFilters([]);
        break;
    }
  }

  const showFiltersButton =
    <div className="show-filters-button" onClick={() => { console.log("clicked"); setShowMobileFilters(prev => !prev); }}>
      {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
    </div>;

  const header = <div className="root-header">
    <div>Countries Search</div>
    {isMobile && showFiltersButton}
  </div>;

  const searchBar =
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search countries..."
        value={searchTerm}
        onChange={handleInputChange}
        className="search-input"
      />
      {searchTerm && (
        <span
          className="clear-search-button"
          onClick={() => handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
        >
          &#x2716;
        </span>
      )}
    </div>;

  const filterPills = filterConfigs.map((filterComponent, index) =>
    <FilterPill key={index} filterComponent={filterComponent} clearFilter={clearFilter} />
  );

  const expandCollapseButton = (
    allDrawersCollapsed ?
      <div className="filter-header-button" onClick={() => expandAllDrawers()}>
        Expand All
      </div> :
      <div className="filter-header-button" onClick={() => collapseAllDrawers()}>
        Collapse All
      </div>
  );

  const filterDrawers = filterConfigs.map((filterComponent, index) => (
    <FilterDrawer
      key={index}
      title={filterComponent.title}
      isExpanded={expandedDrawers[filterComponent.title] || false}
      onToggle={() => handleToggleDrawer(filterComponent.title)}
    >
      {filterComponent.component}
    </FilterDrawer>
  ));

  const filterButtonsAndPills =
    <FilterPillsContainer
      filterPills={filterPills}
      expandCollapseButton={expandCollapseButton}
      clearFilters={clearFilters}
    />;

  const filters =
    <div className="filter-categories-container">
      {isMobile && <div className="mobile-filters-header">Filters</div>}
      {isMobile && filterButtonsAndPills}
      <div className="hide-filters-button" onClick={() => setShowMobileFilters(false)}>&#x2716;</div>
      <div className="filter-categories">
        {filterDrawers}
      </div>
    </div>;

  const countrySearch = <CountrySearch
    isLoading={searchLoading}
    countries={filteredCountries}
    initialSearchComplete={initialSearchComplete}
    searchTerm={searchTerm}
    handleInputChange={handleInputChange} />;

  const filterAndResults =
    (isMobile ?
      <div className="filter-and-results-container">
        < div className={`filter-and-results-mobile`
        }>
          <div className={`mobile-filters-wrapper ${showMobileFilters ? 'show-filters' : 'hide-filters'}`}>
            {filters}
          </div>
          {!showMobileFilters && countrySearch}
        </div >
      </div >
      :
      <div className="filter-and-results-container">
        <div className="filter-and-results-desktop">
          {filters}
          {countrySearch}
        </div>
      </div>
    );

  return (
    <div className="root">
      <div className="wrapper">
        {header}
        {searchBar}
        {!isMobile && filterButtonsAndPills}
        {filterAndResults}
      </div>
    </div>
  );
}

export default Home;
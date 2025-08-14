// ... (keep all your existing imports and other code the same)
import React, { useEffect, useState } from 'react';
import '../css/App.css';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import type { Country } from './App';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import the SDK

interface CountryDetailProps {
    selectedCountry: string;
    setSelectedCountry: React.Dispatch<React.SetStateAction<string>>;
    mapCenter: { lat: number; lng: number } | null;
    borderCountries: Country[];
}

function CountryDetail() {
    // ... (keep all your existing state variables)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allCountries, setAllCountries] = useState<string[]>([]);
    const [countryData, setCountryData] = useState<Country | null>(null);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [borderCountries, setBorderCountries] = useState<Country[]>([]);
    const [countrySummary, setCountrySummary] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    
    // The state and variable for the typing animation have been removed.

    const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    const Maps_API_KEY = process.env.REACT_APP_MAPS_API_KEY;

    const getCountryFromUri = (): string => {
        const path = window.location.pathname;
        const countryName = decodeURIComponent(path.substring(1)).toLowerCase();
        return countryName;
    };

    const [selectedCountry, setSelectedCountry] = useState<string>(getCountryFromUri());

    const handleCountryChange = (newCountry: string) => {
        setSelectedCountry(newCountry);
        window.history.pushState({}, '', `/${encodeURIComponent(newCountry)}`);
    };

    // Effect to fetch country data from restcountries.com
    useEffect(() => {
        const fetchCountryData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`https://restcountries.com/v3.1/name/${selectedCountry}?fullText=true`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Country[] = await response.json();
                const country = data[0];
                setCountryData(country);

                if (country.borders && country.borders.length > 0) {
                    const borderResponses = await Promise.all(
                        country.borders.map(code =>
                            fetch(`https://restcountries.com/v3.1/alpha/${code}`)
                                .then(res => res.ok ? res.json() : null)
                                .catch(() => null)
                        )
                    );
                    const borderCountriesData: Country[] = borderResponses
                        .filter(Boolean)
                        .map((arr: any) => arr && arr[0])
                        .filter(Boolean);
                    setBorderCountries(borderCountriesData);
                } else {
                    setBorderCountries([]);
                }
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (selectedCountry) {
            fetchCountryData();
        }
    }, [selectedCountry]);

    // NEW Effect to fetch map coordinates from your backend
    useEffect(() => {
        const fetchMapCoordinates = async () => {
            if (!countryData || !selectedCountry) {
                setMapCenter(null);
                return;
            }

            try {
                const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/coordinates?country=${selectedCountry}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch coordinates from backend: ${response.statusText}`);
                }
                const coordinates = await response.json();
                console.log('Fetched coordinates:', coordinates);
                
                if (coordinates.error) {
                    throw new Error(coordinates.error);
                }
                
                setMapCenter(coordinates);
            } catch (e) {
                console.error('Error fetching map coordinates:', e);
                setMapCenter(null);
            }
        };

        if (countryData) {
            fetchMapCoordinates();
        }
    }, [countryData, selectedCountry]); 

    // Effect to fetch the country summary from the Gemini API
    useEffect(() => {
        const fetchSummary = async () => {
            if (!countryData || !selectedCountry) return;

            if (!GEMINI_API_KEY) {
                setSummaryError("Gemini API key is not configured.");
                setSummaryLoading(false);
                return;
            }

            setSummaryLoading(true);
            setSummaryError(null);
            setCountrySummary(null);

            try {
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `Provide a concise summary of the country "${selectedCountry}". Include key facts about its geography, culture, and any notable features. Keep it to about 3-4 sentences.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                // We now set the full summary directly
                setCountrySummary(text);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setSummaryError(`Failed to generate summary: ${e.message}`);
                } else {
                    setSummaryError("Failed to generate summary due to an unknown error.");
                }
                console.error("Error generating summary:", e);
            } finally {
                setSummaryLoading(false);
            }
        };

        if (countryData) {
            fetchSummary();
        }
    }, [countryData, selectedCountry, GEMINI_API_KEY]);

    useEffect(() => {
        const fetchAllCountries = async () => {
            try {
                setError(null);
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Country[] = await response.json();
                const sortedCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
                setAllCountries(sortedCountries.map(country => country.name.common));
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("An unknown error occurred while fetching all countries.");
                }
            } finally {
                // No change needed here
            }
        };
        fetchAllCountries();

        const handlePopState = () => {
            setSelectedCountry(getCountryFromUri());
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // The useEffect hook for the typing animation is now gone.
    
    if (loading) {
        return (
            <div className="App-loading">
                <link href='https://fonts.googleapis.com/css?family=Lato' rel='stylesheet'></link>
                <p>Loading country data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="App">
                <header className="App-header">
                    <p>Error: {error}</p>
                </header>
            </div>
        );
    }

    if (!countryData) {
        return (
            <div className="App">
                <header className="App-header">
                    <p>No country data found. Please select a country.</p>
                </header>
            </div>
        );
    }


    return (
        <div className="App">
            <link href='https://fonts.googleapis.com/css?family=Lato' rel='stylesheet'></link>
            <div className="column1">
                <div className="select-wrapper">
                    <select
                        id="country-select"
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}>
                        <option value="">
                            Choose a country
                        </option>
                        {allCountries.map((country: string) => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                </div>
                <h2 className="country-name">{countryData.name.common}</h2>
                {countryData.flags && (
                    <img
                        className="country-flag"
                        src={countryData.flags.png}
                        alt={`Flag of ${countryData.name.common}`}
                    />
                )}
                <div className="country-fact"><b>Official Name:</b> {countryData.name.official}</div>
                <div className="country-fact"><b>CCA3 Code:</b>{countryData.cca3}</div>
                <div className="country-fact"><b>Capital:</b>{countryData.capital && countryData.capital[0] !== '' && countryData.capital[0]}</div>
                <div className="country-fact"><b>Region:</b> {countryData.region}</div>
                <div className="country-fact"><b>Continent:</b> {countryData.continents ? countryData.continents.join(', ') : 'N/A'}</div>

                <div className="country-fact"><b>Population:</b> {countryData.population.toLocaleString()}</div>
                <div className="country-fact"><b>Subregion:</b> {countryData.subregion}</div>
                {borderCountries.length > 0 && (
                    <div className="country-fact">
                        <b className='border-countries-title'>Border Countries:</b>
                        {borderCountries.map((borderCountry) => (
                            <div className="image-container" key={borderCountry.cca3}>
                                <img
                                    src={borderCountry.flags.png}
                                    alt={`Flag of ${borderCountry.name.common}`}
                                    style={{ height: '50px', border: '1px solid #ccc', margin: '0 10px 5px 0' }}
                                    onClick={(e) => handleCountryChange(borderCountry.name.common)}
                                />
                                <span className="tooltip-text">{borderCountry.name.common}</span>
                            </div>

                        ))}
                    </div>
                )}
                {borderCountries.length === 0 && (
                    <p>No border countries</p>
                )}
                {countryData.currencies && (
                    <div className="country-fact">
                        <b>Currency:</b> {Object.values(countryData.currencies)[0].name} (
                        {Object.values(countryData.currencies)[0].symbol})
                    </div>
                )}
                <div className="country-fact"><b>Landlocked:</b> {countryData.landlocked ? 'Yes' : 'No'}</div>
                <div className="country-fact"><b>UN Member:</b> {countryData.unMember ? 'Yes' : 'No'}</div>
                {countryData.languages && Object.keys(countryData.languages).length > 0 && (
                    <div className="country-fact"><b>Languages:</b> {Object.values(countryData.languages).join(', ')}</div>
                )}
                {countryData.car && countryData.car.side && (
                    <div className="country-fact"><b>Driving side:</b>{countryData.car.side.charAt(0).toUpperCase() + countryData.car.side.slice(1)}</div>
                )}
                {countryData.timezones && countryData.timezones.length > 0 && (
                    <div className="country-fact"><b>Timezones:</b> {countryData.timezones.join(', ')}</div>
                )}
                {countryData.startOfWeek && <div className="country-fact"><b>Start of Week:</b> {countryData.startOfWeek.charAt(0).toUpperCase() + countryData.startOfWeek.slice(1)}</div>}
            </div>
            <div className="column2">
                {mapCenter && Maps_API_KEY && (
                    <div className={"map-container"}>
                        <APIProvider apiKey={Maps_API_KEY}>
                            <Map
                                center={mapCenter}
                                zoom={3}
                                mapId={"DEMO_MAP_ID"}
                                style={{ height: '100%', width: '100%' }}
                            >
                                {countryData.capital && countryData.capital.length > 0 && (
                                    <AdvancedMarker position={mapCenter}>
                                        <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
                                    </AdvancedMarker>
                                )}
                            </Map>
                        </APIProvider>
                    </div>
                )}
                <p>
                    <a
                        className="App-link"
                        href={countryData.maps.googleMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View on Google Maps (External Link)
                    </a>
                </p>
                {/* {summaryLoading && <p>Generating summary...</p>} */}
                {/* {summaryError && <p style={{ color: 'red' }}>{summaryError}</p>} */}
                {/* {countrySummary && (
                    <p>
                        <b>Summary:</b> {countrySummary}
                    </p>
                )} */}
            </div>
        </div>
    );
}

export default CountryDetail;
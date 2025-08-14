import '../css/App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CountryDetail from './CountryDetail';
import Home from './Home';
export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca3: string;
  capital?: string[];
  region: string;
  subregion: string;
  flags: {
    png: string;
  };
  coatOfArms?: {
    png?: string;
  };
  population: number;
  currencies?: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
  maps: {
    googleMaps: string;
  };
  latlng: [number, number];
  landlocked?: boolean;
  borders?: string[];
  unMember: boolean;
  languages?: { languageCode: string; languageName: string };
  car?: { signs?: string[]; side?: string };
  timezones?: string[];
  continents?: string[];
  startOfWeek?: string;
  capitalCoordinates?: { latlng: string, coordinates: [number, number] };
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/:countryName" element={
          <CountryDetail/>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
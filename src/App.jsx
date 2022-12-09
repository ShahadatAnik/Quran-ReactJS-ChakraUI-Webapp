import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/index';
import { ColorModeSwitcher } from './theme/ColorModeSwitcher';
import { BackToTop } from './theme/BackToTop';

import SurahSearch from './components/surah/SurahSearch';
import NotFoundPage from './components/utils/NotFoundPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IndividualSurah from './components/surah/index';
import FindWord from './components/findWord/index';
import NavBar from './components/utils/Navbar';
import Home from './components/blogs/index';
import AboutWriters from './components/aboutWritters/index';
import IslamOnWomenRightsAndDignity from './components/blogs/IslamOnWomenRightsAndDignity';
import WomanHahahaShamePassing from './components/blogs/WomanHahahaShamePassing';
import DuaForProphetPart1 from './components/blogs/DuaForProphetPart1';
import DuaForProphetPart2 from './components/blogs/DuaForProphetPart2';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <NavBar />
      <ColorModeSwitcher
        justifySelf="flex-end"
        sx={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: '9999',
        }}
      />
      <BackToTop
        justifySelf="flex-end"
        sx={{
          position: 'fixed',
          bottom: '5rem',
          right: '1rem',
          zIndex: '9999',
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/About-Writers" element={<AboutWriters />} />
          <Route exact path="/Surah" element={<SurahSearch />} />
          <Route exact path="/Find-Word-In-Quran" element={<FindWord />} />
          <Route
            exact
            path="/Islam-On-Women-Rights-And-Dignity"
            element={<IslamOnWomenRightsAndDignity />}
          />
          <Route
            exact
            path="/Woman-Hahaha-Shame-Passing"
            element={<WomanHahahaShamePassing />}
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-1"
            element={<DuaForProphetPart1 />}
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-2"
            element={<DuaForProphetPart2 />}
          />
          <Route
            exact
            path="/surahs/:surahNumber"
            element={<IndividualSurah />}
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;

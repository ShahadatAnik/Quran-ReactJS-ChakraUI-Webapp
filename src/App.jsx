import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/index';
import { ColorModeSwitcher } from './theme/ColorModeSwitcher';

import SurahSearch from './components/surah/SurahSearch';
import NotFoundPage from './components/utils/NotFoundPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IndividualSurah from './components/surah/index';
import FindWord from './components/findWord/index';
import NavBar from './components/utils/Navbar';
import Home from './components/blogs/index';
import Islam_on_womens_rights_and_dignity from './components/blogs/Islam_on_womens_rights_and_dignity';

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
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<Home />} />
          <Route exact path="/surahs" element={<SurahSearch />} />
          <Route exact path="/find-word-from-quran" element={<FindWord />} />
          <Route
            exact
            path="/Islam_on_womens_rights_and_dignity"
            element={<Islam_on_womens_rights_and_dignity />}
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

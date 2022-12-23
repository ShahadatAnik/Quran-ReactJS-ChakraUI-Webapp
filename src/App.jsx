import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Center, ChakraProvider, Spinner } from '@chakra-ui/react';
import theme from './theme/index';

import { ColorModeSwitcher } from './theme/ColorModeSwitcher';
import { BackToTop } from './theme/BackToTop';
import NavBar from './components/utils/Navbar';

function LoadingIcon() {
  return (
    <Center>
      <Spinner
        thickness="6px"
        speed=".65s"
        emptyColor="transparent"
        color="green.500"
        size="xl"
      />
    </Center>
  );
}

const NotFoundPage = lazy(() => import('./components/utils/NotFoundPage'));

const Home = lazy(() => import('./components/blogs/index'));
const SurahSearch = lazy(() => import('./components/surah/SurahSearch'));
const IndividualSurah = lazy(() => import('./components/surah/index'));
const FindWord = lazy(() => import('./components/findWord/index'));
const AboutWriters = lazy(() => import('./components/aboutWritters/index'));

const IslamOnWomenRightsAndDignity = lazy(() =>
  import('./components/blogs/IslamOnWomenRightsAndDignity')
);
const WomanHahahaShamePassing = lazy(() =>
  import('./components/blogs/WomanHahahaShamePassing')
);
const DuaForProphetPart1 = lazy(() =>
  import('./components/blogs/DuaForProphetPart1')
);
const DuaForProphetPart2 = lazy(() =>
  import('./components/blogs/DuaForProphetPart2')
);
const DuaForProphetPart3 = lazy(() =>
  import('./components/blogs/DuaForProphetPart3')
);
const DuaForProphetPart4 = lazy(() =>
  import('./components/blogs/DuaForProphetPart4')
);
const DuaForProphetPart5 = lazy(() =>
  import('./components/blogs/DuaForProphetPart5')
);

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
          <Route path="/" element={<Home />} />
          <Route
            path="/*"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <NotFoundPage />
              </Suspense>
            }
          />
          <Route
            path="/About-Writers"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <AboutWriters />
              </Suspense>
            }
          />

          <Route
            exact
            path="/Surah"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <SurahSearch />
              </Suspense>
            }
          />
          <Route
            exact
            path="/surahs/:surahNumber"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <IndividualSurah />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Find-Word-In-Quran"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <FindWord />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Islam-On-Women-Rights-And-Dignity"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <IslamOnWomenRightsAndDignity />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Woman-Hahaha-Shame-Passing"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <WomanHahahaShamePassing />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-1"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <DuaForProphetPart1 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-2"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <DuaForProphetPart2 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-3"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <DuaForProphetPart3 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-4"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <DuaForProphetPart4 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-5"
            element={
              <Suspense fallback={<LoadingIcon />}>
                <DuaForProphetPart5 />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;

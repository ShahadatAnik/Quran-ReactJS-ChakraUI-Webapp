import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/index';

import { ColorModeSwitcher } from './theme/ColorModeSwitcher';
import { BackToTop } from './theme/BackToTop';
import { Loader } from './theme/Loader';
import NavBar from './components/utils/Navbar';

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
const MuslimsSayingMerryChristmas = lazy(() =>
  import('./components/blogs/MuslimsSayingMerryChristmas')
);

function App() {
  // after some scrolling, show the button
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 500) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 500) {
      setShowScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

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
      {showScroll && (
        <BackToTop
          justifySelf="flex-end"
          sx={{
            position: 'fixed',
            bottom: '5rem',
            right: '1rem',
            zIndex: '9999',
          }}
        />
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/*"
            element={
              <Suspense fallback={<Loader />}>
                <NotFoundPage />
              </Suspense>
            }
          />
          <Route
            path="/About-Writers"
            element={
              <Suspense fallback={<Loader />}>
                <AboutWriters />
              </Suspense>
            }
          />

          <Route
            exact
            path="/Surah"
            element={
              <Suspense fallback={<Loader />}>
                <SurahSearch />
              </Suspense>
            }
          />
          <Route
            exact
            path="/surahs/:surahNumber"
            element={
              <Suspense fallback={<Loader />}>
                <IndividualSurah />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Find-Word-In-Quran"
            element={
              <Suspense fallback={<Loader />}>
                <FindWord />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Islam-On-Women-Rights-And-Dignity"
            element={
              <Suspense fallback={<Loader />}>
                <IslamOnWomenRightsAndDignity />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Woman-Hahaha-Shame-Passing"
            element={
              <Suspense fallback={<Loader />}>
                <WomanHahahaShamePassing />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-1"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart1 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-2"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart2 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-3"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart3 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-4"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart4 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/Dua-For-Prophet-Part-5"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart5 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/For-Muslims-saying-MerryChristmas-means-accepting-the-divinity-of-Isa"
            element={
              <Suspense fallback={<Loader />}>
                <MuslimsSayingMerryChristmas />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;

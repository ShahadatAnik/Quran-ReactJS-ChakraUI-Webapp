import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/index';

import Footer from './components/utils/footer';
import NavBar from './components/utils/Navbar';
import ProgressBar from './components/utils/ProgressBar';
import { BackToTop } from './theme/BackToTop';
import { ColorModeSwitcher } from './theme/ColorModeSwitcher';
import { Loader } from './theme/Loader';

const NotFoundPage = lazy(() => import('./components/utils/NotFoundPage'));

const Home = lazy(() => import('./components/blogs/index'));
const SurahSearch = lazy(() => import('./components/surah/SurahSearch'));
const AyahSearch = lazy(() => import('./components/ayah/index'));
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
      <ProgressBar />
      <ColorModeSwitcher
        justifySelf="flex-end"
        sx={{
          position: 'fixed',
          bottom: '1rem',
          right: '0.1rem',
          zIndex: '9999',
        }}
      />
      {showScroll && (
        <BackToTop
          justifySelf="flex-end"
          sx={{
            position: 'fixed',
            bottom: '5rem',
            right: '0.1rem',
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
            path="/about-writers"
            element={
              <Suspense fallback={<Loader />}>
                <AboutWriters />
              </Suspense>
            }
          />

          <Route
            exact
            path="/surah"
            element={
              <Suspense fallback={<Loader />}>
                <SurahSearch />
              </Suspense>
            }
          />
          <Route
            exact
            path="/surah/:surahNumber"
            element={
              <Suspense fallback={<Loader />}>
                <IndividualSurah />
              </Suspense>
            }
          />
          <Route
            exact
            path="/ayah"
            element={
              <Suspense fallback={<Loader />}>
                <AyahSearch />
              </Suspense>
            }
          />
          <Route
            exact
            path="/find-word"
            element={
              <Suspense fallback={<Loader />}>
                <FindWord />
              </Suspense>
            }
          />
          <Route
            exact
            path="/islam-on-women-rights-and-dignity"
            element={
              <Suspense fallback={<Loader />}>
                <IslamOnWomenRightsAndDignity />
              </Suspense>
            }
          />
          <Route
            exact
            path="/woman-hahaha-shame-passing"
            element={
              <Suspense fallback={<Loader />}>
                <WomanHahahaShamePassing />
              </Suspense>
            }
          />
          <Route
            exact
            path="/dua-for-prophet-part-1"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart1 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/dua-for-prophet-part-2"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart2 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/dua-for-prophet-part-3"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart3 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/dua-for-prophet-part-4"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart4 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/dua-for-prophet-part-5"
            element={
              <Suspense fallback={<Loader />}>
                <DuaForProphetPart5 />
              </Suspense>
            }
          />
          <Route
            exact
            path="/for-muslims-saying-merry-christmas-means-accepting-the-divinity-of-isa"
            element={
              <Suspense fallback={<Loader />}>
                <MuslimsSayingMerryChristmas />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
      <Footer />
    </ChakraProvider>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { Stack } from '@chakra-ui/react';
import SurahAndAyahSelect from './SurahAndAyahSelect';
import SurahAndAyahFullData from './SurahAndAyahFullData';

export default function Index() {
  const [surahTranslationEdition, setSurahTranslationEdition] =
    useState('bn.bengali');
  const [surah, setSurah] = useState(0);
  const [ayah, setAyah] = useState(0);

  console.log(surahTranslationEdition);
  console.log(surah, ayah);

  return (
    <Stack spacing={4} p={2}>
      <SurahAndAyahSelect
        setSurah={setSurah}
        setAyah={setAyah}
        setSurahTranslationEdition={setSurahTranslationEdition}
      />
      <SurahAndAyahFullData
        surah={surah}
        ayah={ayah}
        surahTranslationEdition={surahTranslationEdition}
        surahArabicEdition="quran-uthmani-quran-academy"
      />
    </Stack>
  );
}

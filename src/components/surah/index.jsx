import { useState, useEffect } from 'react';
import { Stack } from '@chakra-ui/react';
import SurahEditionSelect from './SurahEditionSelect';
import SurahFullData from './SurahFullData';

export default function Index() {
  const [surahTranslationEdition, setSurahTranslationEdition] =
    useState('bn.bengali');
  const [surahArabicEdition, setSurahArabicEdition] = useState('quran-simple');
  
  return (
    <Stack spacing={4} p={2}>
      <SurahEditionSelect
        setSurahTranslationEdition={setSurahTranslationEdition}
        setSurahArabicEdition={setSurahArabicEdition}
      />
      <SurahFullData
        surahTranslationEdition={surahTranslationEdition}
        surahArabicEdition={surahArabicEdition}
      />
    </Stack>
  );
}

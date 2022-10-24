import { Stack } from '@chakra-ui/react';
import { useState } from 'react';
import EditionSelect from './EditionSelect';
import QuranSearch from './QuranSearch';
export default function Index() {
  const [quranEdition, setQuranEdition] = useState('en.asad');

  return (
    <Stack spacing={4} p={2}>
      <EditionSelect setQuranEdition={setQuranEdition} />
      <QuranSearch quranEdition={quranEdition} />
    </Stack>
  );
}

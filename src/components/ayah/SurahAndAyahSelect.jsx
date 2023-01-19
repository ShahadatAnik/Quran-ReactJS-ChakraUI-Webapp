import { useState, useEffect } from 'react';
import { Select, Stack } from '@chakra-ui/react';
import { surahs } from '../utils/surahs';

export default function SurahAndAyahSelect({
  setSurah,
  setAyah,
  setSurahTranslationEdition,
}) {
  const [numberOfAyahs, setNumberOfAyahs] = useState(7);
  const handleSurahChange = event => {
    setSurah(event.target.value);
    setNumberOfAyahs(surahs[event.target.value - 1].numberOfAyahs);
    setAyah(0);
  };
  const handleAyahChange = event => {
    setAyah(event.target.value);
  };
  const handelTranslationEditionChange = event => {
    setSurahTranslationEdition(event.target.value);
  };

  const [edition, setEdition] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.alquran.cloud/v1/edition');
      const data = await response.json();
      setEdition(data.data);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  };

  const translationType = edition.filter(
    edition => edition.language !== 'ar' && edition.type === 'translation'
  );

  useEffect(() => {
    fetchData();
    error?.message && console.log(error.message);
  }, [error?.message]);

  return (
    <>
      {isLoading && <div>Loading...</div>}
      <Stack direction={['column', 'column', 'row']} spacing={[2, 2, 4]}>
        <Select
          variant="outline"
          focusBorderColor="green.500"
          bg="green.500"
          color="yellow.300"
          onChange={handelTranslationEditionChange}
          size={['md', 'md', 'lg']}
          placeholder="Select Translation Edition"
        >
          {translationType
            .sort((a, b) => a.language.localeCompare(b.language))
            .map(edition => (
              <option key={edition.identifier} value={edition.identifier}>
                {edition.language} - {edition.englishName} - ({edition.name})
              </option>
            ))}
        </Select>

        <Select
          variant="outline"
          focusBorderColor="green.500"
          bg="green.500"
          color="yellow.300"
          onChange={handleSurahChange}
          size={['md', 'md', 'lg']}
          placeholder="Select Surah"
        >
          {surahs.map(item => (
            <option key={item.number} value={item.number}>
              {item.number} - {item.englishName} - ({item.name})
            </option>
          ))}
        </Select>
        <Select
          variant="outline"
          focusBorderColor="green.500"
          bg="green.500"
          color="yellow.300"
          onChange={handleAyahChange}
          size={['md', 'md', 'lg']}
          placeholder="Select Ayah"
        >
          {/* map for number of ayah */}
          {Array.from(Array(numberOfAyahs).keys()).map(item => (
            <option key={item + 1} value={item + 1}>
              {item + 1}
            </option>
          ))}
        </Select>
      </Stack>
    </>
  );
}

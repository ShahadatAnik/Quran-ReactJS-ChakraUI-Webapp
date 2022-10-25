import { useState, useEffect } from 'react';
import { Select, Stack } from '@chakra-ui/react';

function MySelect({ data, placeholder, setEdition, ...rest }) {
  const handleChange = event => {
    setEdition(event.target.value);
  };
  return (
    <Select
      variant="outline"
      focusBorderColor="green.500"
      bg="green.500"
      color="yellow.300"
      onChange={handleChange}
      {...rest}
      size={['md', 'md', 'lg']}
      placeholder={placeholder}
    >
      {data
        .sort((a, b) => a.language.localeCompare(b.language))
        .map(edition => (
          <option key={edition.identifier} value={edition.identifier}>
            {edition.language} - {edition.englishName} - ({edition.name})
          </option>
        ))}
    </Select>
  );
}

export default function SurahEditionSelect({
  setSurahTranslationEdition,
  setSurahArabicEdition,
}) {
  const [edition, setEdition] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://api.alquran.cloud/v1/edition');
      const data = await response.json();
      setEdition(data.data);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  };

  const arabicType = edition.filter(
    edition =>
      edition.language === 'ar' &&
      edition.type === 'quran' &&
      edition.identifier !== 'quran-tajweed' && // Tajweed is not supported by the API
      edition.identifier !== 'quran-wordbyword' && // Word by Word is not supported by the API
      edition.identifier !== 'quran-kids' && // Kids is not supported by the API
      edition.identifier !== 'quran-corpus-qd' && // Corpus QD is not supported by the API
      edition.identifier !== 'Word by Word Transaltion by Dr. Shehnaz Shaikh' // Word by Word Transaltion by Dr. Shehnaz Shaikh is not supported by the API
  );

  const translationType = edition.filter(
    edition => edition.language !== 'ar' && edition.type === 'translation'
  );

  const tafsirType = edition.filter(
    edition => edition.language !== 'ar' && edition.type === 'tafsir'
  );

  useEffect(() => {
    fetchData();
    error?.message && console.log(error.message);
  }, [error?.message]);

  return (
    <>
      {isLoading && <div>Loading...</div>}
      <Stack direction={['column', 'column', 'row']} spacing={[2, 2, 4]}>
        <MySelect
          data={arabicType}
          placeholder="Select Arabic Edition"
          setEdition={setSurahArabicEdition}
        />
        <MySelect
          data={translationType}
          placeholder="Select Translation"
          setEdition={setSurahTranslationEdition}
        />
      </Stack>
    </>
  );
}

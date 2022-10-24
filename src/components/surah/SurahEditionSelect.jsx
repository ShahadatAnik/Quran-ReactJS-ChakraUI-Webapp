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
      {data.map(edition => (
        <option key={edition.identifier} value={edition.identifier}>
          {edition.englishName} - ({edition.language})
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
    edition => edition.language === 'ar' && edition.type === 'quran'
  );

  const translationType = edition.filter(
    edition => edition.language !== 'ar' && edition.type === 'translation'
  );

  useEffect(() => {
    fetchData();
    error?.message && console.log(error.message);
  }, []);

  return (
    <>
      {isLoading && <div>Loading...</div>}
      <Stack direction={['column', 'column', 'row']} spacing={[2, 2, 4]}>
        <MySelect
          data={arabicType}
          placeholder="Arabic (Default: Simple)"
          setEdition={setSurahArabicEdition}
        />
        <MySelect
          data={translationType}
          placeholder="Translation (Default: মুহিউদ্দীন খান)"
          setEdition={setSurahTranslationEdition}
        />
      </Stack>
    </>
  );
}

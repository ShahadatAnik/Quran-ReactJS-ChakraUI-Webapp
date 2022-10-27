import { useState, useEffect } from 'react';
import { Select, Stack, Center, Spinner } from '@chakra-ui/react';

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

export default function EditionSelect({ setQuranEdition }) {
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

  useEffect(() => {
    fetchData();
    error?.message && console.log(error.message);
  }, [error?.message]);

  return (
    <>
      {isLoading && (
        <Center>
          <Spinner
            thickness="6px"
            speed=".65s"
            emptyColor="transparent"
            color="green.500"
            size="xl"
          />
        </Center>
      )}
      <Stack direction={['column', 'column', 'row']} spacing={[2, 2, 4]}>
        <MySelect
          data={edition}
          placeholder="Select Quran Language To Search"
          setEdition={setQuranEdition}
        />
      </Stack>
    </>
  );
}

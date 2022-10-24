import { surahs } from './surahs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Text, Box, Grid, GridItem } from '@chakra-ui/react';

export default function SurahSearch() {
  const [surah, setSurah] = useState(surahs);

  const handleSearch = searchValue => {
    let value = searchValue.toLowerCase();

    const newFilterData = surahs.filter(surah => {
      const countryName = surah.englishName.toLowerCase();
      return countryName.includes(value);
    });
    setSurah(newFilterData);
  };

  return (
    <Box p={2}>
      <Input
        type="text"
        placeholder="Surah Name"
        autoFocus
        focusBorderColor="green.500"
        onChange={e => handleSearch(e.target.value)}
      />
      <Grid
        templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
        gap={6}
      >
        {surah.map(surah => (
          <Link to={`/surahs/${surah.number}`}>
            <GridItem
              key={surah.number}
              boxShadow={['md', 'md', 'lg']}
              p={4}
              m={2}
              borderRadius="md"
              bg="green.500"
              color="yellow.300"
              _hover={{ bg: 'green.600' }}
              textAlign="center"
            >
              <Text fontSize="4xl" fontWeight="bold" color="yellow.300">
                {surah.name}
              </Text>
              <Text fontSize={['md', 'lg', 'xl']} fontWeight="bold">
                {surah.englishName}
              </Text>
              <Text fontSize={['md', 'lg', 'xl']} fontWeight="bold">
                {surah.revelationType} - {surah.numberOfAyahs}
              </Text>
            </GridItem>
          </Link>
        ))}
      </Grid>
    </Box>
  );
}

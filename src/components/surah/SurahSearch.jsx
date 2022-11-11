import { surahs } from './surahs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Input,
  Text,
  Box,
  Grid,
  GridItem,
  Center,
  useColorMode,
} from '@chakra-ui/react';

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
    <Box p={2} mx={2}>
      <Center mb={4}>
        <Input
          type="text"
          placeholder="Surah Name"
          autoFocus
          focusBorderColor={
            useColorMode().colorMode === 'light' ? 'green.500' : 'yellow.300'
          }
          size={'lg'}
          maxW={'lg'}
          alignSelf={'center'}
          onChange={e => handleSearch(e.target.value)}
        />
      </Center>
      <Grid
        templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
        gap={[2, 2, 4]}
      >
        {surah.map((surah, index) => (
          <Link to={`/surahs/${surah.number}`}>
            <GridItem
              key={surah.number}
              boxShadow={['md', 'md', 'lg']}
              p={4}
              m={2}
              borderRadius="md"
              bg={index % 2 === 0 ? 'green.500' : 'green.700'}
              color="yellow.300"
              _hover={{ bg: 'green.600' }}
              textAlign="center"
            >
              <Text fontSize="4xl" fontWeight="bold" color="yellow.300">
                {surah.name}
              </Text>
              <Text fontSize={['md', 'lg', 'xl']} fontWeight="bold">
                {surah.number}. {surah.englishName}
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

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Input,
  Link,
  SimpleGrid,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useState } from 'react';
import { surahs } from '../utils/surahs';

export default function SurahSearch() {
  const [surah, setSurah] = useState(surahs);
  const { colorMode } = useColorMode();

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
      <SimpleGrid columns={[1, 2, 3, 4]} spacing={4} mx={2}>
        {surah.map((surah, index) => (
          <Card
            key={surah.number}
            as={Link}
            rel="noopener noreferrer"
            href={`/surah/${surah.number}`}
            textAlign="center"
            boxShadow={['md', 'md', 'lg']}
            p={4}
            m={2}
            borderRadius="md"
            bg={useColorMode().colorMode === 'light' ? 'gray.500' : 'green.600'}
            color="yellow.300"
            _hover={{
              textDecoration: 'none',
              borderColor: 'yellow.300',
              boxShadow: '0 0 20px 15px #ffff00',
            }}
          >
            <CardHeader>
              <Text fontSize="4xl" fontWeight="bold" color="yellow.300">
                {surah.name}
              </Text>
            </CardHeader>
            <CardBody>
              <Text fontSize={['md', 'lg', 'xl']} fontWeight="bold">
                {surah.number}. {surah.englishName}
              </Text>
              <Text fontSize={['md', 'lg', 'xl']} fontWeight="bold">
                {surah.revelationType} - {surah.numberOfAyahs}
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}

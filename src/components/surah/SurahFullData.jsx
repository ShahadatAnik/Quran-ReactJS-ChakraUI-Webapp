import {
  Stack,
  Text,
  useColorMode,
  Box,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFatch';

function Header({
  name,
  englishName,
  englishNameTranslation,
  numberOfAyahs,
  revelationType,
  ...rest
}) {
  return (
    <>
      <Stack
        spacing={1}
        align="center"
        p={2}
        {...rest}
        bg="green.500"
        color="yellow.300"
        rounded={10}
      >
        <Text
          fontSize={['6xl', '4xl', '6xl']}
          fontWeight="bold"
          color="yellow.300"
        >
          {name}
        </Text>
        <Text fontSize={['md', 'lg', 'xl']} fontWeight="bold">
          {englishName} - {englishNameTranslation}
        </Text>
        <Text fontSize={['md', 'lg', 'xl']} fontWeight="bold">
          {revelationType} - {numberOfAyahs}
        </Text>
      </Stack>
    </>
  );
}

export default function SurahFullData({
  surahTranslationEdition,
  surahArabicEdition,
}) {
  const { surahNumber } = useParams();
  const { colorMode, toggleColorMode } = useColorMode();

  // chakra ui mode

  const {
    data: translation,
    loading: translationLoading,
    error: translationError,
  } = useFetch(
    `http://api.alquran.cloud/v1/surah/${surahNumber}/editions/${surahTranslationEdition}`
  );

  const {
    data: arabic,
    loading: arabicLoading,
    error: arabicError,
  } = useFetch(
    `http://api.alquran.cloud/v1/surah/${surahNumber}/editions/${surahArabicEdition}`
  );

  return (
    <Box>
      {arabicLoading && (
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
      {arabic?.data && (
        <>
          <Header
            name={arabic.data[0].name}
            number={arabic.data[0].number}
            englishName={arabic.data[0].englishName}
            englishNameTranslation={arabic.data[0].englishNameTranslation}
            revelationType={arabic.data[0].revelationType}
            numberOfAyahs={arabic.data[0].numberOfAyahs}
          />
          {arabic.data[0].ayahs.map((ayah, index) => (
            <Stack
              key={index}
              direction={['column', 'column', 'row']}
              spacing={[2, 2, 4]}
              align="center"
              flex="1"
              p={4}
              m={2}
              bg={
                colorMode === 'light'
                  ? index % 2 === 0
                    ? 'gray.100'
                    : 'gray.200'
                  : index % 2 === 0
                  ? 'gray.700'
                  : ''
              }
              rounded="lg"
            >
              <Text fontSize={['xl', '2xl', '4xl']} fontWeight="bold">
                {ayah.numberInSurah}
              </Text>
              <Center w={['100%', '100%', '100%']}>
                <Stack
                  direction={['column', 'column', 'column']}
                  align="center"
                  spacing={1}
                >
                  <Text
                    fontSize={['2xl', '2xl', '4xl']}
                    fontWeight="bold"
                    textAlign="justify"
                    color={colorMode === 'light' ? 'green.600' : 'yellow.300'}
                    sx={{
                      direction: 'rtl',
                    }}
                  >
                    {ayah.text}
                  </Text>
                  <Text
                    fontSize={['md', 'lg', 'xl']}
                    textAlign="justify"
                    color={colorMode === 'light' ? 'yellow.600' : 'green.200'}
                  >
                    {translation.data ? (
                      <>{translation.data[0].ayahs[index].text}</>
                    ) : (
                      <Spinner
                        thickness="4px"
                        speed=".65s"
                        emptyColor="transparent"
                        color="green.500"
                        size="md"
                      />
                    )}
                  </Text>
                </Stack>
              </Center>
            </Stack>
          ))}
        </>
      )}
    </Box>
  );
}

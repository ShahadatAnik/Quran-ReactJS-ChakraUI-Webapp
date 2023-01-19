import {
  Stack,
  Text,
  useColorMode,
  Box,
  Center,
  Spinner,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useFetch } from '../hooks/useFatch';
import '../../customDesign/style.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

function Header({
  name,
  englishName,
  englishNameTranslation,
  numberOfAyahs,
  revelationType,
  ...rest
}) {
  return (
    <Stack
      spacing={1}
      align="center"
      p={2}
      mx={2}
      {...rest}
      bg="green.500"
      color="yellow.300"
      rounded={10}
      fontWeight="bold"
    >
      <Text fontSize={'6xl'}>{name}</Text>
      <Text fontSize={['md', 'lg', 'xl']}>
        {englishName} - {englishNameTranslation}
      </Text>
      <Text fontSize={['md', 'lg', 'xl']}>
        {revelationType} - {numberOfAyahs}
      </Text>
    </Stack>
  );
}

export default function SurahAndAyahFullData({
  surah,
  ayah,
  surahTranslationEdition,
}) {
  const { colorMode } = useColorMode();

  const {
    data: ayahArabicData,
    loading: ayahArabicLoading,
    error: ayahArabicError,
  } = useFetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.alafasy`);

  const {
    data: ayahTranslationData,
    loading: ayahTranslationLoading,
    error: ayahTranslationError,
  } = useFetch(
    `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${surahTranslationEdition}`
  );

  const ayahArabic = ayahArabicData?.data;
  const {
    data: audioFetch,
    loading: audioLoading,
    error: audioError,
  } = useFetch(
    `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${ayahArabic?.number}.mp3`
  );

  console.log(audioFetch);

  if (ayah === 0) {
    return (
      <Center>
        <Text
          marginY={12}
          padding={5}
          fontSize={['2xl', '2xl', '4xl']}
          fontWeight="bold"
          color={colorMode === 'light' ? 'red.700' : 'red.400'}
        >
          Please Select Both Surah And Ayah
        </Text>
      </Center>
    );
  }

  console.log(ayahArabic?.audioSecondary[0]);

  return (
    <>
      <Header
        name={ayahArabic?.surah?.name}
        number={ayahArabic?.surah?.number}
        englishName={ayahArabic?.surah?.englishName}
        englishNameTranslation={ayahArabic?.surah?.englishNameTranslation}
        revelationType={ayahArabic?.surah?.revelationType}
        numberOfAyahs={ayahArabic?.surah?.numberOfAyahs}
      />
      <Stack
        direction={['column', 'column', 'row']}
        spacing={[2, 2, 4]}
        align="center"
        flex="1"
        p={4}
        m={2}
        // bg={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        rounded="lg"
      >
        <Text fontSize={['xl', '2xl', '4xl']} fontWeight="bold">
          Ayah - {ayahArabic?.numberInSurah}
        </Text>
        <Center flex="1">
          <Stack
            direction={['column', 'column', 'column']}
            align="center"
            spacing={1}
            flex="1"
            sx={{
              textAlign: 'justify',
            }}
          >
            <Text
              fontSize={['3xl', '3xl', '4xl']}
              fontWeight="bold"
              color={colorMode === 'light' ? 'green.600' : 'yellow.300'}
              sx={{
                direction: 'rtl',
              }}
            >
              {ayahArabic?.text}
            </Text>
            <Text
              fontSize={['md', 'lg', 'xl']}
              color={colorMode === 'light' ? 'yellow.600' : 'green.200'}
              fontFamily={['Hind Siliguri']}
              mt={4}
            >
              {ayahTranslationData?.data ? (
                <>{ayahTranslationData?.data?.text}</>
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

            {/* <audio controls>
              <source
                src={`${ayahArabic?.audioSecondary[0]}`}
                type="audio/mp3"
              />
            </audio> */}

            {/* {audioFetch ? (
              <audio controls>
                <source
                  src={`
                        ${audioFetch}
                        `}
                  type="audio/mp3"
                />
              </audio>
            ) : (
              <Spinner
                thickness="4px"
                speed=".65s"
                emptyColor="transparent"
                color="green.500"
                size="md"
              />
            )} */}
          </Stack>
        </Center>
      </Stack>
    </>
  );
}

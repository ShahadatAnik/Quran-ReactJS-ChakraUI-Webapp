import { Stack, Text, useColorMode, Center, Spinner } from '@chakra-ui/react';
import { useFetch } from '../hooks/useFatch';
import '../../customDesign/style.css';
import '../utils/audio.css';

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
      bg="gray.00"
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

  return (
    <>
      <Header
        name={ayahArabicData?.data?.surah?.name}
        number={ayahArabicData?.data?.surah?.number}
        englishName={ayahArabicData?.data?.surah?.englishName}
        englishNameTranslation={
          ayahArabicData?.data?.surah?.englishNameTranslation
        }
        revelationType={ayahArabicData?.data?.surah?.revelationType}
        numberOfAyahs={ayahArabicData?.data?.surah?.numberOfAyahs}
      />

      <Center flex="1">
        <Stack
          direction={['column', 'column', 'column']}
          align="center"
          spacing={3}
          flex="1"
          p={2}
          my={10}
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
            {ayahArabicData?.data?.text}
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

          {ayahArabicData?.data?.audioSecondary[0] ? (
            <audio controls key={ayahArabicData?.data?.audioSecondary[0]}>
              <source
                src={`${ayahArabicData?.data?.audioSecondary[0]}`}
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
          )}
        </Stack>
      </Center>
    </>
  );
}

import {
  Box,
  Center,
  IconButton,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import '../../customDesign/style.css';
import { useFetch } from '../hooks/useFatch';
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

function Navigation({ icon, name, path, surahNumber, position, ...rest }) {
  const { colorMode } = useColorMode();
  let num =
    position === 'left'
      ? parseInt(`${surahNumber}`) - 1
      : parseInt(`${surahNumber}`) + 1;
  let style = position === 'left' ? { left: '0.1rem' } : { right: '0.1rem' };
  let placement = position;
  let label = position === 'left' ? 'Previous Surah' : 'Next Surah';

  if (position === 'left' && num === 0) {
    num = 114;
  }

  if (position === 'right' && num === 115) {
    num = 1;
  }

  const SwitchIcon = position === 'left' ? FaArrowLeft : FaArrowRight;

  return (
    <Tooltip
      hasArrow
      closeDelay={300}
      placement={placement}
      label={label}
      fontSize="md"
      bg={colorMode === 'light' ? 'yellow.600' : 'yellow.300'}
    >
      <IconButton
        icon={<SwitchIcon size="20px" />}
        as="a"
        color={colorMode === 'light' ? 'yellow.600' : 'yellow.300'}
        fontWeight="bold"
        rounded={10}
        variant="ghost"
        sx={{
          position: 'fixed',
          bottom: '50%',
          zIndex: '9999',
          ...style,
        }}
        href={`/surah/${num}`}
        {...rest}
      />
    </Tooltip>
  );
}

export default function SurahFullData({
  surahTranslationEdition,
  surahArabicEdition,
}) {
  const { surahNumber } = useParams();
  const { colorMode } = useColorMode();

  // chakra ui mode

  const {
    data: translation,
    loading: translationLoading,
    error: translationError,
  } = useFetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${surahTranslationEdition}`
  );

  const {
    data: arabic,
    loading: arabicLoading,
    error: arabicError,
  } = useFetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${surahArabicEdition}`
  );

  const {
    data: audioFetch,
    loading: audioLoading,
    error: audioError,
  } = useFetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);

  const audio = audioFetch?.data?.ayahs;

  const audioPlay = audio => {
    audio.map((item, index) => {
      var audio = new Audio(item.audio);
      audio.play();
    });
  };

  return (
    <Box>
      <Navigation position="left" surahNumber={surahNumber} />
      <Navigation position="right" surahNumber={surahNumber} />

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
                  ? ''
                  : 'gray.700'
              }
              rounded="lg"
            >
              <Text fontSize={['xl', '2xl', '4xl']} fontWeight="bold">
                {ayah.numberInSurah}
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
                    fontSize={['4xl', '4xl', '4xl']}
                    fontWeight="bold"
                    color={colorMode === 'light' ? 'green.600' : 'yellow.300'}
                    sx={{
                      direction: 'rtl',
                    }}
                  >
                    {ayah.text}
                  </Text>
                  <Text
                    fontSize={['xl', '2xl', '2xl']}
                    color={colorMode === 'light' ? 'yellow.600' : 'green.200'}
                    fontFamily={['Hind Siliguri']}
                    mt={4}
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
                  {audio ? (
                    <audio
                      controls
                      // handel the audio if another ayah is clicked then pause the previous one
                      // onPlay={() => {
                      //   audio.map((item, index) => {
                      //     if (
                      //       item.audioSecondary[0] !==
                      //       audio[index].audioSecondary[0]
                      //     ) {
                      //       audio.pause();
                      //     }
                      //   });
                      // }}
                    >
                      <source
                        src={`
                        ${audio[index].audioSecondary[0]}
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
                  )}
                </Stack>
              </Center>
            </Stack>
          ))}
        </>
      )}
    </Box>
  );
}

import { useColorMode } from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { usePlaceholder } from '../hooks/usePlaceholder';
import { useWindowResize } from '../hooks/useWindowResize';

import {
  Box,
  Center,
  Highlight,
  Input,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';

function Header({ name, englishName, englishNameTranslation, ...rest }) {
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
    </Stack>
  );
}
export default function QuranSearch({ quranEdition }) {
  const [quranData, setQuranData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchWord, setSearchWord] = useState('');
  const { colorMode } = useColorMode();

  const { placeholder } = usePlaceholder(quranEdition.split('.')[0]);

  useEffect(() => {
    const abortCont = new AbortController();

    try {
      fetch(
        `https://api.alquran.cloud/v1/search/${searchWord}/all/${quranEdition}`,
        { signal: abortCont.signal }
      )
        .then(res => {
          setIsLoading(false);
          return res.json();
        })
        .then(data => {
          setQuranData(data.data.matches);
          setIsLoading(false);
        });
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch Aborted');
      } else {
        setIsLoading(false);
        console.log(err.message);
      }
    }
    return () => abortCont.abort();
  }, [searchWord, quranEdition]);

  // dynamic row size based on the number of ayahs
  const listRef = useRef();

  const sizeMap = useRef({});
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef.current.resetAfterIndex(index);
  }, []);

  const getSize = index => sizeMap.current[index] || 50;
  const [windowWidth] = useWindowResize();

  const Row = ({ index, setSize, windowWidth }) => {
    const { colorMode } = useColorMode();
    const rowRef = useRef();

    useEffect(() => {
      setSize(index, rowRef.current.getBoundingClientRect().height);
    }, [setSize, index, windowWidth]);

    const showHeader = index => {
      if (index === 0) {
        return (
          <Header
            name={quranData[index]?.surah.name}
            number={quranData[index]?.surah.number}
            englishName={quranData[index]?.surah.englishName}
            englishNameTranslation={
              quranData[index]?.surah.englishNameTranslation
            }
          />
        );
      } else if (
        quranData[index - 1] &&
        quranData[index - 1].surah.name != quranData[index].surah.name
      ) {
        return (
          <Header
            name={quranData[index]?.surah.name}
            number={quranData[index]?.surah.number}
            englishName={quranData[index]?.surah.englishName}
            englishNameTranslation={
              quranData[index]?.surah.englishNameTranslation
            }
          />
        );
      }
    };

    if (isLoading) {
      return (
        <Center>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Center>
      );
    }
    return (
      <div
        ref={rowRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {showHeader(index)}
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
          <Text fontSize={['2xl', '2xl', '4xl']} fontWeight="bold">
            {quranData[index]?.numberInSurah}
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
                fontSize={['xl', 'xl', '2xl']}
                color={colorMode === 'light' ? 'yellow.600' : 'green.200'}
                fontFamily={['Hind Siliguri']}
                mt={4}
              >
                <Highlight
                  query={searchWord}
                  styles={{ px: '1', py: '0', rounded: 'full', bg: 'red.100' }}
                >
                  {quranData[index]?.text}
                </Highlight>
              </Text>
            </Stack>
          </Center>
        </Stack>
      </div>
    );
  };

  return (
    <Box mt={4}>
      <Center mb={4}>
        <Input
          type="text"
          autoFocus
          placeholder={`Search in ${placeholder}`}
          size={'lg'}
          maxW={'lg'}
          focusBorderColor={colorMode === 'light' ? 'green.500' : 'yellow.300'}
          onChange={e => setSearchWord(e.target.value.trim())}
        />
      </Center>
      <Center>
        {isLoading && (
          <Spinner
            thickness="4px"
            speed=".65s"
            emptyColor="transparent"
            color="green.500"
            size="md"
          />
        )}
        {quranData?.length > 0 && searchWord !== '' ? (
          <List
            ref={listRef}
            height={window.innerHeight - 220}
            width="100%"
            itemCount={quranData.length}
            itemSize={getSize}
            itemData={quranData}
          >
            {({ index, style }) => (
              <div style={style}>
                <Row
                  index={index}
                  setSize={setSize}
                  windowWidth={windowWidth}
                />
              </div>
            )}
          </List>
        ) : (
          <Center>
            <Text
              marginY={12}
              padding={5}
              fontSize={['2xl', '2xl', '4xl']}
              fontWeight="bold"
              color={colorMode === 'light' ? 'red.700' : 'red.400'}
            >
              No Results Found
            </Text>
          </Center>
        )}
      </Center>
    </Box>
  );
}

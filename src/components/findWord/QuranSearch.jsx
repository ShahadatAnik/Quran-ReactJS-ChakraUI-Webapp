import { useState, useEffect, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import { usePlaceholder } from '../hooks/usePlaceholder';
import { useWindowResize } from '../hooks/useWindowResize';
import { useColorMode } from '@chakra-ui/react';

import { Stack, Input, Text, Box, Center, Highlight } from '@chakra-ui/react';

function Header({ name, englishName, numberOfAyahs, ...rest }) {
  return (
    <Stack
      spacing={1}
      m={2}
      align="center"
      p={2}
      color="green.500"
      bg="yellow.300"
      rounded={10}
      direction="column"
      {...rest}
    >
      <Text fontSize={['xl', 'xl', '2xl']} fontWeight="bold">
        {name}
      </Text>
      <Text fontSize={['md', 'lg', 'sm']} fontWeight="bold">
        {englishName} - {numberOfAyahs}
      </Text>
    </Stack>
  );
}
export default function QuranSearch({ quranEdition }) {
  const [quranData, setQuranData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchWord, setSearchWord] = useState('');

  const { placeholder } = usePlaceholder(quranEdition.split('.')[0]);

  useEffect(() => {
    const abortCont = new AbortController();

    try {
      fetch(
        `http://api.alquran.cloud/v1/search/${searchWord}/all/${quranEdition}`,
        { signal: abortCont.signal }
      )
        .then(res => {
          if (res.statusText !== 'OK') {
            setIsLoading(false);
            throw Error('Could not fetch the data for that resource');
          }
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

  const listRef = useRef();

  const sizeMap = useRef({});
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef.current.resetAfterIndex(index);
  }, []);
  const getSize = index => sizeMap.current[index] || 50;
  const [windowWidth] = useWindowResize();

  const Row = ({ index, setSize, windowWidth }) => {
    const rowRef = useRef();

    useEffect(() => {
      setSize(index, rowRef.current.getBoundingClientRect().height);
    }, [setSize, index, windowWidth]);

    return (
      <div
        ref={rowRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="column"
          key={quranData[index]?.number}
          spacing={1}
          m={2}
          align="center"
          p={2}
          bg="green.500"
          color="yellow.300"
          rounded={10}
        >
          <Header
            name={quranData[index]?.surah.name}
            englishName={quranData[index]?.surah.englishName}
            numberOfAyahs={quranData[index]?.numberInSurah}
          />
          <Text fontSize={['md', 'md', 'lg']} fontWeight="bold">
            <Highlight
              query={searchWord}
              styles={{ px: '1', py: '0', rounded: 'full', bg: 'red.100' }}
            >
              {quranData[index]?.text}
            </Highlight>
          </Text>
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
          focusBorderColor={
            useColorMode().colorMode === 'light' ? 'green.500' : 'yellow.300'
          }
          onChange={e => setSearchWord(e.target.value.trim())}
        />
      </Center>
      <Center>
        {isLoading && <div>Loading...</div>}
        {quranData.length > 0 ? (
          <List
            ref={listRef}
            height={window.innerHeight - 200}
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
          <Text fontSize={['md', 'md', 'lg']} fontWeight="bold" mt={5}>
            No results found
          </Text>
        )}
      </Center>
    </Box>
  );
}

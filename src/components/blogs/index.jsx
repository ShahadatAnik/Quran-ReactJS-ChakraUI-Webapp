import {
  useColorMode,
  Box,
  Stack,
  Text,
  Link,
} from '@chakra-ui/react';
import { BanglaHeading } from '../../customDesign';
import { blogData } from './blogsData';
// import Footer from '../utils/footer';
export default function Index() {
  const { colorMode } = useColorMode();
  return (
    <Box as="section">
      <Box p={4}>
        <Stack direction="column" spacing={4}>
          {blogData.map(blog => (
            <Link
              rel="noopener noreferrer"
              key={blog.number}
              href={`/${blog.englishName}`}
              _hover={{ textDecoration: 'none' }}
            >
              <Box
                shadow={'lg'}
                rounded={'md'}
                p={4}
                bg={colorMode === 'light' ? 'gray.200' : 'gray.600'}
              >
                <BanglaHeading as={'h1'}>{blog.name}</BanglaHeading>
                <Text mt={2}>
                  {blog.date} <span>&emsp;</span>/ <span>&emsp;</span>
                  {blog.writer}
                </Text>
              </Box>
            </Link>
          ))}
        </Stack>
      </Box>
      {/* <Grid
        templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(2, 1fr)']}
        gap={[2, 2, 4]}
      >
        {blogData.map((blog, index) => (
          <Link
            rel="noopener noreferrer"
            key={blog.number}
            href={`/${blog.englishName}`}
            _hover={{ textDecoration: 'none' }}
          >
            <GridItem
              key={blog.number}
              boxShadow={['md', 'md', 'lg']}
              p={4}
              m={2}
              borderRadius="md"
              bg={index % 2 === 0 ? 'green.500' : 'green.700'}
              color="yellow.300"
              _hover={{ bg: 'green.600' }}
              textAlign="center"
            >
              <BanglaHeading as={'h1'}>{blog.name}</BanglaHeading>
                <Text mt={2}>
                  {blog.date} <span>&emsp;</span>/ <span>&emsp;</span>
                  {blog.writer}
                </Text>
            </GridItem>
          </Link>
        ))}
      </Grid> */}
      {/* <Footer /> */}
    </Box>
  );
}

import {
  useColorMode,
  Box,
  Container,
  Stack,
  Text,
  Link,
} from '@chakra-ui/react';
import { BanglaHeading } from '../../customDesign';
import { blogData } from './blogsData';

export default function Index() {
  const { colorMode } = useColorMode();
  return (
    <Box as="section">
      <Box p={4}>
        <Stack direction={['column']} align="stretch" spacing={4}>
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
    </Box>
  );
}

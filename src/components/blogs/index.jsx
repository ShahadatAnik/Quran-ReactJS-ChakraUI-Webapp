import {
  Card,
  CardBody,
  CardHeader,
  Link,
  SimpleGrid,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { BanglaHeading } from '../../customDesign';
import { blogData } from './blogsData';
export default function Index() {
  const { colorMode } = useColorMode();
  return (
    <SimpleGrid columns={[1, 1, 3]} spacing={4} mx={2}>
      {blogData.map(blog => (
        <Card
          key={blog.number}
          as={Link}
          bg={colorMode === 'light' ? 'gray.200' : 'gray.600'}
          rel="noopener noreferrer"
          href={`/${blog.englishName}`}
          _hover={{ textDecoration: 'none' }}
        >
          <CardHeader>
            <BanglaHeading as={'h1'}>{blog.name}</BanglaHeading>
          </CardHeader>
          <CardBody>
            <Text>
              {blog.date} <span>&emsp;</span>/ <span>&emsp;</span>
              {blog.writer}
            </Text>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}

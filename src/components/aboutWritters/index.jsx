import {
  useColorMode,
  Box,
  Stack,
  Text,
  Link,
  IconButton,
} from '@chakra-ui/react';
import { BanglaHeading } from '../../customDesign';
import { writersData } from './writersData';

export default function Index() {
  const { colorMode } = useColorMode();

  return (
    <Box p={4}>
      <BanglaHeading mb={6} align="center">
        যাদের থেকে লেখা গুলো নেওয়া হয়েছে তাদের সম্পর্কে কিছু তথ্য:
      </BanglaHeading>
      <Stack direction={['column']} align="stretch" spacing={4}>
        {writersData.map(writer => (
          <Box
            shadow={'lg'}
            rounded={'md'}
            p={4}
            bg={colorMode === 'light' ? 'gray.200' : 'gray.600'}
          >
            <BanglaHeading as={'h1'}>{writer.writer}</BanglaHeading>
            {writer.about.split('####').map(item => (
              <Text mt={2} fontSize="xl"
              sx={{
                textAlign: 'justify',
              }}
              >
                {item}
              </Text>
            ))}
            <Text mt={2}>
              {writer?.links.map(l => (
                <IconButton
                  as={Link}
                  href={l.link}
                  icon={l.icon}
                  isExternal
                  size="lg"
                  variant="ghost"
                  marginRight={2}
                />
              ))}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

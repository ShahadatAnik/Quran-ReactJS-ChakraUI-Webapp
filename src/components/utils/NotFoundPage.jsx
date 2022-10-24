import React from 'react';
import { Center, Stack } from '@chakra-ui/react';

export default function NotFoundPage() {
  return (
    <Center h="80vh">
      <Stack align={'center'}>
        <h1>404</h1>
        <h2>Page Not Found</h2>
      </Stack>
    </Center>
  );
}

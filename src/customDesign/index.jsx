import { useState, useRef } from 'react';
import {
  Heading,
  Text,
  Box,
  useColorMode,
  Flex,
  Button,
  Tooltip,
  Spacer,
  useToast,
} from '@chakra-ui/react';
import { BiShareAlt } from 'react-icons/bi';
import './style.css';

// Boshonto -> Heading
// Hind Siliguri -> Body
// SolaimanLipi -> Body
// CharukolaUltraLight -> Body
// Galada -> Quran Bangla ayat italic
// LalSabujNormal -> Quran Bangla ayat
// BenSenHandwriting -> Quran Bangla ayat

export function BanglaTitle({ children, ...rest }) {
  return (
    <Heading
      as={'h1'}
      align={'center'}
      fontSize={['4xl', '4xl', '6xl']}
      color={useColorMode().colorMode === 'light' ? 'yellow.500' : 'yellow.300'}
      fontFamily={['Boshonto']}
      {...rest}
    >
      {children}
    </Heading>
  );
}

export function BanglaTime({
  Date,
  Writer,
  windowLocation,
  children,
  ...rest
}) {
  const [copySuccess, setCopySuccess] = useState('শেয়ার করতে চান?');
  const toast = useToast();

  async function copyToClip() {
    navigator.clipboard.writeText(windowLocation);
    setCopySuccess('কপি করা হয়েছে!');
    if (window.innerWidth < 500) {
      alert('কপি করা হয়েছে!');
    } else {
      toast({
        title: 'কপি করা হয়েছে!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }
  return (
    <Flex
      alignItems="center"
      gap={2}
      justifyContent="center"
      alignContent="center"
      fontFamily={['SolaimanLipi']}
      {...rest}
    >
      <Text
        mt={2}
        align={'left'}
        color={'gray.500'}
        fontSize={['md', 'md', 'lg']}
        fontFamily={['Boshonto']}
        {...rest}
      >
        {Date}
      </Text>
      {'>>'}
      <Text
        mt={2}
        align={'left'}
        color={'gray.500'}
        fontSize={['md', 'md', 'lg']}
        fontFamily={['Boshonto']}
        {...rest}
      >
        {Writer}
      </Text>
      <Spacer />
      <Tooltip label={copySuccess}>
        <Button variant="ghost" color="current" onClick={() => copyToClip()}>
          <BiShareAlt size="1.5em" color={'green.500'} />
        </Button>
      </Tooltip>
    </Flex>
  );
}

export function BanglaHeading({ children, ...rest }) {
  return (
    <Text
      mt={4}
      color={useColorMode().colorMode === 'light' ? 'yellow.500' : 'yellow.300'}
      fontSize={['3xl', '3xl', '4xl']}
      fontFamily={['Boshonto']}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function BanglaText({ Heading, children, ...rest }) {
  return (
    <>
      {Heading && <BanglaHeading>{Heading}</BanglaHeading>}
      <Text
        fontSize={['2xl', '2xl', '3xl']}
        letterSpacing="wide"
        justifyContent={'flex-end'}
        fontFamily="Hind Siliguri"
        justifySelf={'flex'}
        sx={{
          textAlign: 'justify',
          textJustify: 'inter-word',
          hyphens: 'auto',
        }}
        {...rest}
      >
        {Heading?.length > 0 ? null : <span>&emsp;</span>}
        {children}
      </Text>
    </>
  );
}

export function ArabicAyatAndTranslation({
  Arabic,
  Translation,
  Reference,
  children,
  ...rest
}) {
  return (
    <Box
      bg={useColorMode().colorMode === 'light' ? 'gray.200' : 'gray.600'}
      align={'center'}
      rounded={'md'}
      p={2}
      mt={2}
      mb={2}
      fontSize={['md', 'md', 'xl']}
      fontFamily={['Galada']}
      {...rest}
    >
      <Text
        justifyContent={['center', 'center', 'left']}
        fontSize={['3xl', '3xl', '4xl']}
        fontWeight="bold"
        fontFamily={['CharukolaUltraLight']}
        color={
          useColorMode().colorMode === 'light' ? 'yellow.600' : 'yellow.300'
        }
        {...rest}
      >
        {Arabic}
      </Text>
      {Translation && (
        <Text
          justifyContent={['center', 'center', 'left']}
          fontSize={['xl', 'xl', '2xl']}
          as="i"
          fontFamily={['BenSenHandwriting']}
          sx={{
            textAlign: 'justify',
            textJustify: 'inter-word',
            hyphens: 'auto',
          }}
          {...rest}
        >
          {Translation}
        </Text>
      )}
      <Text
        justifyContent={['center', 'center', 'left']}
        fontSize={['xl', 'xl', '2xl']}
        color={
          useColorMode().colorMode === 'light' ? 'yellow.600' : 'yellow.300'
        }
        as="i"
        ml={2}
        fontFamily={['BenSenHandwriting']}
        {...rest}
      >
        {'>> ' + Reference}
      </Text>
      {children}
    </Box>
  );
}

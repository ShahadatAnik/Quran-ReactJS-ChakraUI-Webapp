import React from 'react';
import { BiUpArrowCircle } from 'react-icons/bi';
import {
  useColorMode,
  useColorModeValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';

export const BackToTop = props => {
  // back to top
  const backToTop = () => {
    // smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Tooltip
      label={`Back to top`}
      aria-label={`Back to top`}
      fontSize="sm"
      bg={useColorModeValue('gray.100', 'gray.900')}
      color="current"
      placement="left"
    >
      <IconButton
        size="md"
        fontSize="lg"
        bg={useColorModeValue('gray.100', 'gray.900')}
        color="current"
        onClick={backToTop}
        icon={<BiUpArrowCircle />}
        {...props}
      />
    </Tooltip>
  );
};

import React from 'react';
import {
  useColorMode,
  useColorModeValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';

export const ColorModeSwitcher = props => {
  const { toggleColorMode } = useColorMode();
  const text = useColorModeValue('dark', 'light');
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);

  return (
    <Tooltip
      label={`Switch to ${text} mode`}
      aria-label={`Switch to ${text} mode`}
      fontSize="sm"
      bg={useColorModeValue('gray.100', 'gray.900')}
      color="current"
      placement="left"
    >
      <IconButton
        size="md"
        fontSize="lg"
        aria-label={`Switch to ${text} mode`}
        bg={useColorModeValue('gray.100', 'gray.900')}
        color="current"
        onClick={toggleColorMode}
        icon={<SwitchIcon />}
        {...props}
      />
    </Tooltip>
  );
};

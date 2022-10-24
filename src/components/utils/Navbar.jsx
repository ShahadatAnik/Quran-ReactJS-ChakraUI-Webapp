import React from 'react';
import { Link, Box, Flex, Text, Button, Stack } from '@chakra-ui/react';

function Logo(props) {
  return (
    <Box as="a" {...props}>
      <Link color={'green.500'} href="/">
        <Text
          bgGradient="linear(to-r, yellow.300, green.500)"
          _hover={{
            color: 'yellow.300',
          }}
          bgClip="text"
          fontSize="4xl"
          fontWeight="extrabold"
        >
          Quran
        </Text>
      </Link>
    </Box>
  );
}

const NavBar = props => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <NavBarContainer {...props}>
      <Logo />
      <MenuToggle toggle={toggle} isOpen={isOpen} />
      <MenuLinks isOpen={isOpen} />
    </NavBarContainer>
  );
};

const CloseIcon = () => (
  <svg width="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <title>Close</title>
    <path
      fill="green.600"
      d="M9.00023 7.58599L13.9502 2.63599L15.3642 4.04999L10.4142 8.99999L15.3642 13.95L13.9502 15.364L9.00023 10.414L4.05023 15.364L2.63623 13.95L7.58623 8.99999L2.63623 4.04999L4.05023 2.63599L9.00023 7.58599Z"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24px"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    fill="green.600"
  >
    <title>Menu</title>
    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
  </svg>
);

const MenuToggle = ({ toggle, isOpen }) => {
  return (
    <Box display={{ base: 'block', md: 'none' }} onClick={toggle}>
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </Box>
  );
};

const MenuItem = ({ children, isLast, to = '/', ...rest }) => {
  return (
    <Link color={'yellow.300'} href={to}>
      <Text
        display="block"
        bg={to === window.location.pathname ? 'yellow.300' : 'green.500'}
        color={to === window.location.pathname ? 'green.500' : 'yellow.300'}
        _hover={{
          color: 'green.500',
          backgroundColor: 'yellow.300',
        }}
        fontWeight="bold"
        px={3}
        py={1}
        rounded="md"
        {...rest}
      >
        {children}
      </Text>
    </Link>
  );
};

const MenuLinks = ({ isOpen }) => {
  return (
    <Box
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
      flexBasis={{ base: '100%', md: 'auto' }}
    >
      <Stack
        spacing={8}
        align="center"
        color={['white', 'white', 'primary.700', 'primary.700']}
        justify={['center', 'space-between', 'flex-end']}
        direction={['column', 'row', 'row', 'row']}
        pt={[4, 4, 0, 0]}
      >
        <MenuItem to="/">Home</MenuItem>
        <MenuItem to="/surahs">Surahs</MenuItem>
        <MenuItem to="/find-word-from-quran">Quran Word Search</MenuItem>
        {/* <MenuItem to="/signup" isLast>
          <Button
            size="sm"
            rounded="md"
            color={["primary.500", "primary.500", "white", "white"]}
            bg={["white", "white", "primary.500", "primary.500"]}
            _hover={{
              bg: ["primary.100", "primary.100", "primary.600", "primary.600"]
            }}
          >
            Create Account
          </Button>
        </MenuItem> */}
      </Stack>
    </Box>
  );
};

const NavBarContainer = ({ children, ...props }) => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={2}
      p={2}
      bg={'green.500'}
      {...props}
    >
      {children}
    </Flex>
  );
};

export default NavBar;

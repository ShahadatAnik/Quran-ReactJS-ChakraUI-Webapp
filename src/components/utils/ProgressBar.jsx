import { Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { useColorMode } from '@chakra-ui/react';

function ProgressBar() {
  const progressRef = useRef(null);
  const { colorMode } = useColorMode();
  useEffect(() => {
    const updateProgress = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressRef.current.style.width = scrolled + '%';
    };
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="9999"
      height="4px"
      bg="none"
      overflow="hidden"
      roundedRight="md"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        height="100%"
        bg={colorMode === 'light' ? 'yellow.500' : 'yellow.300'}
        ref={progressRef}
        roundedRight="md"
        // a simple transition from left to right
        transition="width 0.5s ease-out"
      ></Box>
    </Box>
  );
}

export default ProgressBar;

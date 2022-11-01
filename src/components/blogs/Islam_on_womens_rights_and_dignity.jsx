import React from 'react';
import {
  BanglaTitle,
  BanglaText,
  ArabicAyatAndTranslation,
  BanglaTime,
} from '../../customDesign';
import {
  Box,
  Text,
  Container,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from '@chakra-ui/react';

function TransitionExample({ isOpen, onOpen, onClose, cancelRef, ...rest }) {
  return (
    <>
      <Button onClick={onOpen}>Discard</Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Discard Changes?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to discard all of your notes? 44 words will be
            deleted.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export default function Islam_on_womens_rights_and_dignity() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  return (
    <Container
      maxW="container.md"
      as="section"
      justifyContent={'center'}
      onCopy={e => {
        e.preventDefault();
        onOpen();
      }}
      onCut={e => {
        e.preventDefault();
        onOpen();
      }}
    >
      <BanglaTitle>নারীর অধিকার ও মর্যাদায় ইসলাম</BanglaTitle>
      <BanglaTime
        Date="01 November, 2022"
        Writer="মোঃ তানভীর হসসাইন"
        windowLocation={window.location.href}
      />

      <BanglaText Heading={`ভূমিকা:`}>
        মহান আল্লাহর নিকট ইসলামই একমাত্র মনােনীত দ্বীন (আলে ইমরান ১৯)। আর এই
        দ্বীনে মহান আল্লাহ নারীর মর্যাদাকে উর্ধ্বে তুলে ধরেছেন। নর-নারীর
        সমন্বয়েই মানব জাতি। নারী জাতি হ'ল মহান আল্লাহর এক বিশেষ নে'মত। আল্লাহ
        তা'আলা নারীকে পুরুষের জীবন সঙ্গিনী হিসাবে মানব জীবন পরিচালনার জন্য
        পারস্পরিক সহযােগী করেছেন। ইসলাম মর্যাদার দিক দিয়ে নারীকে পুরুষের থেকে
        ভিন্ন করে দেখেনি। বরং ইসলামের আগমনেই নির্যাতিত, নিপীড়িত, অবহেলিত নারী
        সমাজ পেয়েছে মুক্তির সন্ধান। সারা দুনিয়াতে যখন নারীরা নিদারুণ অবস্থায়।
        কালাতিপাত করছিল, আরব, ইউরােপ ও অন্যান্য দেশে তাদেরকে জন্তু-জানােয়ার বলে
        মনে করা হ'ত এবং মানুষ হিসাবে তাদের কোন মর্যাদা ও অধিকার স্বীকার করা হ'ত
        না, তখন ইসলাম নারীর যথাযথ অধিকার ও মর্যাদা প্রদান করে নারী। জাতিকে
        সম্মানের সুউচ্চ আসনে অধিষ্ঠিত করেছে। যেমন আল্লাহ তা'আলা পুরুষদের প্রতি
        ইঙ্গিত করে বলেন,
        <ArabicAyatAndTranslation
          Arabic={`
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ مِنْ نَفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا وَبَثَّ مِنْهُمَا رِجَالًا كَثِيرًا وَنِسَاءً ۚ وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ ۚ إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا
          `}
          Translation={`হে মানব সমাজ! তোমরা তোমাদের 
          পালনকর্তাকে ভয় কর, যিনি তোমাদেরকে এক ব্যক্তি 
          থেকে সৃষ্টি করেছেন এবং যিনি তার থেকে তার সঙ্গীনীকে 
          সৃষ্টি করেছেন; আর বিস্তার করেছেন তাদের দু’জন থেকে 
          অগণিত পুরুষ ও নারী। আর আল্লাহকে ভয় কর, যাঁর নামে 
          তোমরা একে অপরের নিকট যাচঞ্ঝা করে থাক এবং আত্নীয় 
          জ্ঞাতিদের ব্যাপারে সতর্কতা অবলম্বন কর। নিশ্চয় আল্লাহ 
          তোমাদের ব্যাপারে সচেতন রয়েছেন।`}
          Reference={`সুরাঃ নিসা, আয়াতঃ ১`}
        />
      </BanglaText>

      <BanglaText Heading={`ইসলামে নারীর অধিকার ও মর্যাদা:`}>
        মর্যাদা অর্থ- গৌরব, সম্ভ্রম, সম্মান, মূল্য ইত্যাদি। আর নারীর মর্যাদা
        বলতে নারীর। ন্যায়সঙ্গত অধিকারকে বুঝায়। আর অধিকার অর্থ প্রাপ্য, পাওনা
        ইত্যাদি। কারাে অধিকার প্রদানের অর্থ হচ্ছে তার প্রাপ্য বা পাওনা যথাযথভাবে
        প্রদান
      </BanglaText>

      <BanglaText>
        মর্যাদা অর্থ- গৌরব, সম্ভ্রম, সম্মান, মূল্য ইত্যাদি। আর নারীর মর্যাদা
        বলতে নারীর। ন্যায়সঙ্গত অধিকারকে বুঝায়। আর অধিকার অর্থ প্রাপ্য, পাওনা
        ইত্যাদি। কারাে অধিকার প্রদানের অর্থ হচ্ছে তার প্রাপ্য বা পাওনা যথাযথভাবে
        প্রদান
      </BanglaText>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogBody>
            অনুমতি ব্যতিত ব্লগের কোনো পোস্ট কপি করে অন্যত্র প্রকাশ করা যাবে না।
            করা হলে তা লেখকের হক নষ্ট করা হচ্ছে বলে গণ্য হবে।
          </AlertDialogBody>
          <AlertDialogCloseButton bg={'red.500'} />
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
}

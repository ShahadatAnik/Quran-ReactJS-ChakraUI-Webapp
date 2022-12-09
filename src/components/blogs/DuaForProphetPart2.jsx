import React from 'react';
import {
  BanglaTitle,
  BanglaText,
  ArabicAyatAndTranslation,
  BanglaTime,
  Hadith,
} from '../../customDesign';
import {
  Container,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogCloseButton,
  AlertDialogBody,
  useDisclosure,
} from '@chakra-ui/react';

export default function DuaForProphetPart2() {
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
      <BanglaTitle>
        দরুদ সমাধানের বারুদ: রাসুলের উপর দরুদ পাঠ করার অপরিসীম গুরুত্ব এবং দরুদ
        না পড়ার পরিণতি ও শাস্তি
      </BanglaTitle>
      <BanglaTime
        Date="07 December, 2022"
        Writer="Nusus"
        windowLocation={window.location.href}
      />
      <BanglaText>
        রাসুলুল্লাহ্ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেন,
        <Hadith
          Bangla={`
          ‘‘কিছু মানুষ যখন কোনো মজলিসে (বৈঠকে) বসে, সেখানে যদি তারা আল্লাহর যিকর না করে এবং তাদের নবির উপর সালাত (দরুদ) পাঠ না করে, তবে তা তাদের জন্য পরিতাপ-আফসোসের কারণ হবে। ইচ্ছা করলে আল্লাহ তাদের শাস্তি দেবেন আর ইচ্ছা করলে তিনি তাদের মাফ করে দেবেন।’’
          `}
          References={`
          ইমাম তিরমিযি, আস-সুনান: ৩৩৮০; হাদিসটি সহিহ
          `}
        />
      </BanglaText>
      <BanglaText>
        অন্য হাদিসে দরুদ পাঠ না করা ব্যক্তিকে কৃপণ হিসেবে সম্বোধন করা হয়েছে।
        নবিজি বলেন,
        <Hadith
          Bangla={`
          ‘‘কৃপণ ঐ ব্যক্তি, যার সামনে আমার আলোচনা করা হলো, অথচ সে আমার জন্য দরুদ পাঠ করলো না।’’
          `}
          References={`
          ইমাম তিরমিযি, আস-সুনান: ৩৫৪৬; হাদিসটি সহিহ
          `}
        />
      </BanglaText>
      <BanglaText color={'red.500'} fontWeight="bold">
        আমাদের দু‘আ কবুল হওয়ার অন্যতম একটি মাধ্যম হলো, দু‘আর পূর্বে রাসূলের উপর
        দরুদ পাঠ করা।
      </BanglaText>
      <BanglaText>
        উমার (রা.) বলেছেন,
        <Hadith
          Bangla={`
          ‘‘নিশ্চয়ই দু‘আ আসমান-জমিনের মাঝখানে স্থগিত অবস্থায় থাকে, যতক্ষণ না নবির উপর দরুদ পাঠ করা হয়, তার কিছুই উপরে ওঠে না।’’
          `}
          References={`
          ইমাম তিরমিযি, আস-সুনান: ৪৮৬; হাদিসটি হাসান
          `}
        />
        আলি (রা.) বলেন,
        <Hadith
          Bangla={`
          ‘‘সকল দু‘আ পর্দার আড়ালে থাকবে, যতক্ষণ না নবির উপর সালাত পাঠ করবে।’’
          `}
          References={`
          ইমাম তাবারানি, মু‘জামুল আওসাত্ব: ৭২১; শায়খ আলবানি, সিলসিলা সহিহাহ: ২০৩৫; বর্ণনাটি হাসান
          `}
        />
      </BanglaText>

      <BanglaText>
        এজন্য আলিমগণ দু‘আ করার আগে দরুদ পাঠ করার ব্যাপারে বিশেষ গুরুত্বারোপ
        করেন।
        <br />
        কারো সামনে নবি সাল্লাল্লাহু আলাইহি ওয়াসাল্লামের আলোচনা করা হলে, তার উপর
        কর্তব্য হলো, সে দরুদ পাঠ করবে।
        <br />
        নবি করিম সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বেশ কঠিন ভাষায় বলেছেন,
        <Hadith
          Bangla={`
          ‘‘ওই ব্যক্তির নাক ধূলি-ধুসরিত হোক (অপদস্থ হোক), যার সামনে আমার আলোচনা করা হলো, অথচ সে আমার জন্য দরুদ পাঠ করলো না।’’
          `}
          References={`
          ইমাম তিরমিযি, আস-সুনান: ৩৫৪৫; হাদিসটি হাসান সহিহ
          `}
        />
      </BanglaText>
      <BanglaText>
        এগুলো তো গেলো দরুদ পাঠের গুরুত্ব ও না পড়ার ধমকি। আর দরুদ পাঠ করার বিরাট
        বিরাট ফজিলত ও লাভ রয়েছে। সেগুলো আমরা পরের পর্বে আলোচনা করবো,
        ইনশাআল্লাহ্। আজ একটি ফজিলত তুলে ধরবো, যেটি কমই আলোচিত হয়।
      </BanglaText>
      <BanglaText>
        রাসুলুল্লাহ্ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেন,
        <Hadith
          Bangla={`
          ‘‘যে ব্যক্তি আমার উপর একবার দরুদ পাঠ করে, আমি তার জন্য ১০ বার দরুদ পাঠ করি (দু‘আ করি)।’’
          `}
          References={`
          ইমাম তাবারানি, মু‘জামুল আওসাত্ব: ১৬৪২; ইমাম তাবারানি বর্ণনাকারীগণকে নির্ভরযোগ্য বলেছেন
          `}
        />
      </BanglaText>
      <BanglaText></BanglaText>
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

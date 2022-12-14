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

export default function WomanHahahaShamePassing() {
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
        বেডা মানুষ, বেডি মানুষ, Women Haha ইত্যাদি বলায় ঘৃণা চর্চা
      </BanglaTitle>
      <BanglaTime
        Date="13 November, 2022"
        Writer="Nusus"
        windowLocation={window.location.href}
      />

      <BanglaText>
        বর্তমানে হাসি-ঠাট্টা আর ট্রলের ছলে মানুষের ইজ্জত-সম্মানের উপর হামলা করা
        হচ্ছে। কিছু একটা হলেই বলছে, "বাদ দেন, বেডা মানুষ", "বাদ দেন, বেডি মানুষ"
        ইত্যাদি। প্রথম দিকে এটি কিছুটা সহনীয় ছিলো, কিন্তু এখন এটা ব্যাপকহারে
        ছড়িয়ে পড়েছে। অনলাইনের মতো জায়গায় যখন কাউকে নিয়ে এভাবে গণহারে ট্রলিং হয়,
        তখন আর সেটিকে শুধু ‘ফান’ মনে করার সুযোগ নেই। এটি এখন রীতিমতো জুলুম এবং
        সম্মানহানি।
      </BanglaText>

      <BanglaText>
        রাসুলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেন,
        <Hadith
          Bangla={`
          "আল্লাহ আমার নিকট এই
          মর্মে ওহি (ঐশী প্রত্যাদেশ) প্রেরণ করেছেন যে, তোমরা বিনয়ী হও। কেউ যেন
          কারও উপর অহংকার না করে এবং কেউ যেন কারও সাথে জুলুম না করে।"
          `}
          References={`
          ইমাম মুসলিম, আস-সহিহ:
          ৭১০২
          `}
        />
      </BanglaText>

      <BanglaText>
        নবি সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেন,
        <Hadith
          Bangla={`
          ""মিরাজে গমনের রাতে আমি এমন কিছু
          মানুষের পাশ দিয়ে অতিক্রম করেছিলাম, যাদের নখগুলো ছিলো তামার তৈরি; তারা
          (সেই নখ দিয়ে) তাদের চেহারা এবং বুক আঁচড়ে ফেলছিলো। তখন আমি বললাম "হে
          জিবরিল! এরা কারা?" তিনি বলেন, "এরা সেইসব লোক, যারা মানুষের মাংস খেতো
          (অর্থাৎ গিবত করতো; কুরআনে গিবত করাকে মানুষের মাংস খাওয়া বলা হয়েছে) এবং
          মানুষের মান-সম্মানে আঘাত করতো।"
          `}
          References={`
          ইমাম আবু দাউদ, আস-সুনান: ৪৮৭৮; ইমাম
        আহমাদ, আল-মুসনাদ: ১৩৩৪০; হাদিসটি সহিহ
          `}
        />
      </BanglaText>
      <BanglaText>
        অনেকে বলতে পারেন, আপনারা অযথাই বাড়াবাড়ি করছেন। এগুলোর মাধ্যমে কেবল মজা
        করা হয়, কারও ইজ্জতহানি হয় না। আমরা বলবো, আপনাদের কথা সঠিক নয়।
        সাধারণভাবেই যখন কাউকে নিয়ে ট্রল হয়, তখন সেটি অন্যায়। আর এখানে সেই ট্রলের
        পাশাপাশি লিঙ্গপরিচয় নিয়েও ট্রলিং হচ্ছে। এগুলো চরম অসভ্যতা। ট্রলটার
        কেন্দ্রে যে ভিকটিম থাকে, সে তো এসবে মজা পায় না; তার তো কষ্ট অনুভূত হয়;
        তাহলে আপনাদের মজাটা কি আসলেই মজা না টর্চার? একটা দুটা উদাহরণ পেশ করে,
        ট্রল করে কোনো গোষ্ঠীকে পঁচানো ননসেন্স কাজ। যে ছেলেটা "Women" বলে
        হাসাহাসি করছে, সে কি তার মা-বোন-মেয়েকে নিয়েও এভাবে ঠাট্টা করে? যে মেয়েটা
        "বাদ দেন, বেডা মানুষ" বলে মজা নিচ্ছে, সে কি তার বাবা-ভাই-ছেলেকে নিয়েও
        এভাবে বিদ্রূপ করে?
      </BanglaText>

      <BanglaText>
        বিশেষ করে, এই ট্রলটা শুরু হয়েছিলো চায়ের কাপ ☕ হাতে দুই লোকের "Women
        Haha" দিয়ে। এতদিন একচেটিয়াভাবে নারীদেরকে পঁচানো হয়েছে। এখন অবশ্য উভয়ে
        উভয়কে পঁচাচ্ছে। যাহোক, যেহেতু নারীদের অসম্মান করেই এর সূচনা এবং
        নারীদেরকেই বেশি ট্রল করা হচ্ছে, সেহেতু দুটো হাদিস পড়ুন। রাসুল
        সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেন—
        <Hadith
          Arabic={`
          لا تَكرَهوا البناتِ فإنَّهنَّ المؤنِساتُ الغالياتُ
          `}
          Bangla={`
          তোমরা কন্যাদেরকে অপছন্দ/ঘৃণা করো না। কারণ তারা আনন্দদায়ী, মূল্যবান (সম্মানিত)।
          `}
          References={`
              ইমাম সুয়ুতি, আল-জামি‘উস সগির: ৯৮৪০; শায়খ আলবানি, সিলসিলা সহিহাহ: ৩২০৬; হাদিসটি সহিহ
          `}
        />
        রাসুলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম বলেছেন,
        <Hadith
          Bangla={`
          “কোনো মুমিন পুরুষ
          কোনো মুমিন নারীর প্রতি বিদ্বেষ-ঘৃণা পোষণ করবে না; যদি তার (মুমিন নারীর)
          কোনো অভ্যাস-বৈশিষ্ট্য সে অপছন্দ করে, তাহলে তার অন্য কোনো
          অভ্যাস-বৈশিষ্ট্য তাকে (মুমিন পুরুষকে) খুশি করবে, আনন্দ দেবে।” 
          `}
          References={`
          ইমাম
          মুসলিম, আস-সহিহ: ৩৫৪০
          `}
        />
      </BanglaText>

      <BanglaText>
        আল্লাহর কাছে শ্রেষ্ঠত্বের মানদণ্ড একমাত্র তাকওয়া বা আল্লাহভীতি।
        লিঙ্গবৈষম্যের স্থান ইসলামে নেই। আল্লাহর প্রিয় হওয়ার জন্য নারী হওয়া বা
        পুরুষ হওয়া জরুরি নয়। পাচ্ছে। আল্লাহ তা‘আলা বলেন,
        <ArabicAyatAndTranslation
          Translation={`
          "নিশ্চয়ই আল্লাহর নিকট তোমাদের মধ্যে সবচেয়ে সম্মানিত
          সে, যে সর্বাধিক তাকওয়াবান।"
          `}
          Surah={`হুজুরাত `}
          Ayat={`১৩`}
        />
      </BanglaText>

      <BanglaText>
        আল্লাহ তা‘আলা আরও বলেন,
        <ArabicAyatAndTranslation
          Translation={`
          "যে মুমিন অবস্থায় নেক আমল করবে—সে পুরুষ হোক বা
        নারী—তাকে আমি পবিত্র জীবন দান করবো এবং তারা (দুনিয়াতে নেক আমল) যা করতো,
        তার তুলনায় অবশ্যই আমি তাদেরকে (আখিরাতে) উত্তম প্রতিদান দেবো।"
          `}
          Surah={`নাহল `}
          Ayat={`৯৭`}
        />
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

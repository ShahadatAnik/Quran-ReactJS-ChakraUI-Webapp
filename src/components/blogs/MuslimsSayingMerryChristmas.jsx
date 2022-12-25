import React from 'react';
import {
  BanglaTitle,
  BanglaText,
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

export default function DuaForProphetPart3() {
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
        মুসলমানদের জন্যে “মেরি ক্রিসমাস” বলার মানে হচ্ছে ঈসা (আঃ) এর দেবত্ব মেনে
        নেয়া
      </BanglaTitle>
      <BanglaTime
        Date="25 December, 2022"
        Writer="ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর রাহিমাহুল্লাহ"
        windowLocation={window.location.href}
      />
      <BanglaText>
        মুসলমানদের জন্যে “মেরি ক্রিসমাস”, “হ্যাপি ক্রিসমাস”, “শুভ বড়দিন” বলার
        মানে হচ্ছে ঈসা (আঃ) এর দেবত্ব মেনে নেয়া (Divinity). এটা বিশ্বাস করে
        বলেই খ্রিস্টানরা 'বড়দিন' উৎযাপন করে। যা সম্পূর্ণ “শিরকী” বিশ্বাস।
      </BanglaText>
      <BanglaText>
        যে কোনো খৃষ্টান ধর্মালম্বী এই দিন ও তার উৎসব পালন করতেই পারেন। তা পালনে
        তাদের ধর্মীয় স্বাধীনতা আছে। কারন এটি তাদের ধর্মীয় বিশ্বাস। যে বিশ্বাস ও
        তা পালনের স্বাধীনতায় ইসলাম হস্তক্ষেপ করেনা। একই সাথে তাদের ধর্মীয় বিষয়ে
        কোনো কটুক্তি বা উপাস্যকে গালমন্দও করেনা। কিন্তু হযরত ঈসা আলাইহিস সালাম
        মুসলমানদেরও একজন সম্মানিত নবী হিসেবে তাঁর প্রতি বিশ্বাসের ধরনের প্রকৃতি
        জানাতে বিষয়টির উপস্থাপন করা হয়েছে।
        <Hadith
          Bangla={`
        ধর্ম যার ধর্মীয় উৎসব এবং ধর্মীয় সম্ভাষণও তার
        `}
          References={`সাইফুল্লাহ`}
        />
      </BanglaText>
      <BanglaText>
        খৃস্টধর্মে মিথ্যার অনুপ্রবেশের বড় প্রমাণ ২৫শে ডিসেম্বরকে বড়দিন (ক্রিসমাস
        : Christmas) বা ঈসা মাসীহের জন্মদিন বলে বিশ্বাস, প্রচার ও উদযাপন করা।
        অথচ ঈসা মাসীহ ২৫ ডিসেম্বর জন্মগ্রহণ করেছেন- কথাটি যেমন শতভাগ অসত্য,
        তেমনি এ দিবসটি পালন করা ঈসা মাসীহের শিক্ষা— এ কথাও শতভাগ অসত্য। এ দুটি
        মহা অসত্য-ই এখন “ঈসায়ী তরীকা”-য় পরিণত হয়েছে।
      </BanglaText>
      <BanglaText>
        খৃস্টধর্মের সর্বোচ্চ গুরু পোপ বেনিডিক্ট ১৬ (Benedict XVI) স্বয়ং “Jesus
        of Nazareth: The Infance Narratives” নামে একটি পুস্তক রচনা করেছেন, যাতে
        তিনি সুস্পষ্টভাবে উল্লেখ করেছেন যে, ২৫ শে ডিসেম্বর ঈসা মাসীহের জন্মদিন
        হওয়ার বিষয়টি সম্পূর্ণ ভিত্তিহীন ও মিথ্যা।
      </BanglaText>

      <BanglaText>
        এ মিথ্যার সাথে সংযুক্ত হয়েছে “বিদ‘আত” বা উদ্ভাবন। ঈসা মাসীহের জন্ম যে
        দিনই হোক না কেন, দিনটি উদযাপন করার কোনোরূপ নির্দেশনা ইঞ্জিলে নেই।
        খৃস্টান গবেষকগণ একমত যে, যীশুর পরের ৩০০ বৎসর পর্যন্ত কোনো খৃস্টান কখনোই
        যীশুর জন্মদিন পালন করেন নি। ঈসা মাসীহ নিজে এবং পরবর্তী ৩০০ বৎসরের
        খৃস্টানরা যা পালন করলেন না সেটিকে “ঈসায়ী তরীকা” বা “খৃস্টধর্ম” নামে
        প্রতিষ্ঠা করা হলো। মাইক্রোসফট এনকার্টায় ক্রিসমাস আর্টিকেলের বক্তব্য:
        <Hadith
          Arabic={`
        Historiansareunsure exactly when Christians first began celebrating the Nativity of Christ. However, most scholars believe that Christmas originated in the 4th century as a Christian substitute for pagan celebrations of the winter solstice.
        `}
          Bangla={`
          “ঠিক কবে থেকে যীশুর জন্মদিন উদযাপনের জন্য খৃস্টানগণ ক্রিসমাস পালন শুরু করেন সে বিষয়ে ঐতিহাসিকগণ নিশ্চিত নন। তবে অধিকাংশ গবেষক বিশ্বাস করেন যে, পৌত্তলিক শীতকালীন উত্তরায়ণ উৎসবের বিকল্প হিসেবে ৪র্থ শতকে ক্রিসমাস পালনের আয়োজন করা হয়।”
          `}
        />
      </BanglaText>
      <BanglaText>
        যে কোনো ইনসাইক্লোপিডিয়া বা ইন্টারনেটে Origin of Christmas বা ক্রিসমাসের
        উৎপত্তি বিষয়ে পাঠ করলে দেখবেন যে, মূলত রোমান-গ্রীকদের দলে ভেড়ানোর জন্যই
        খৃস্টান ধর্মগুরুগণ এ উৎসবটির উদ্ভাবন করেন। গ্রীক-রোমান পৌত্তলিক ধর্মের
        অনুসারীরা ডিসেম্বরের শেষে ফসলের দেবতা Saturn এবং আলোর দেবতা Mithra-এর
        পূজা উপলক্ষ্যে ব্যাপক উৎসব করত। পাদরিগণ পৌত্তলিকদেরকে ধর্মে ভিড়ানোর জন্য
        এ সময়ে ক্রিসমাস উৎসব চালু করেন। তারা বলতে চান, আমরাও তো তোমাদের মতই একই
        ধর্মের মানুষ এবং একই উৎসব করি। যেমন মুসলিমদেরকে তারা বলেন: ‘আমরাও
        মুসলিম, ঈসায়ী মুসলিম!
      </BanglaText>
      <BanglaText>
        বড়দিনের আরেকটি জালিয়াতি “সান্তা ক্লজ” (Santa Claus)। সারা বিশ্বে
        খৃস্টানগণ বিশ্বাস ও প্রচার করেন যে, ক্রিসমাস-রাত্রিতে সান্তা ক্লজ
        প্রত্যেক খৃস্টান বাড়িতে যেয়ে ক্রিসমাসের দোয়া-উপহার রেখে আসেন। বিশেষত
        “ভাল” ছেলেমেয়েদের পায়ের মোজার মধ্যে উপহার রেখে আসেন! যুগযুগ ধরে এ
        মিথ্যাটি খৃস্টানগণ জেনেশুনেই বলেন। এ পুরো কাহিনীই বানোয়াট।
      </BanglaText>
      <BanglaText>
        ঈসায়ী প্রচারককে বলুন: যে মিথ্যা কথাটি ব্যবসা, সমাজ বা রাজনীতিতে বললে
        ফৌজদারি অপরাধ ও শাস্তি হতো, তার চেয়েও ভয়ঙ্কর মিথ্যা আপনারা ধর্মের নামে
        বলছেন!! আপনি যে ‘কিতাবুল মোকাদ্দস’ প্রচার করছেন সে গ্রন্থেও তো মিথ্যা
        নিষিদ্ধ করা হয়েছে। বলা হয়েছে:
        <Hadith
          Bangla={`
          “তোমরা চুরি করিও না এবং আপন আপন স্বজাতীয়কে বঞ্চনা করিও না, ও মিথ্যা বলিও না।”
          `}
          References={`
          লেবীয় ১৯/১১
          `}
        />
        আপনার ইঞ্জিলের শেষ বইয়েও বলা হয়েছে যে, মিথ্যার শাস্তি অনন্ত জাহান্নাম:
        <Hadith
          Bangla={`
            “কিন্তু জ্বলন্ত আগুন ও গন্ধকের হ্রদের মধ্যে থাকাই হবে ভীতু, বেঈমান, ঘৃণার যোগ্য, খুনী, জেনাকারী, জাদুকর, মূর্তিপূজাকারী এবং সব মিথ্যাবাদীদের শেষ দশা। এটাই হল দ্বিতীয় মৃত্যু।”
            `}
          References={`
            প্রকাশিত বাক্য/কালাম ২১/৮
            `}
        />
      </BanglaText>
      {/* Copy paste alert dialog */}
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
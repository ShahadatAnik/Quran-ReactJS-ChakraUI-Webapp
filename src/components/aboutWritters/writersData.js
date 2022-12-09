import { FaFacebook, FaYoutube, FaLink } from 'react-icons/fa';
export const writersData = [
  {
    number: 1,
    writer: 'মাসিক আত তাহরীক',
    about: `Monthly At-Tahreek, Which is running from Rajshahi is an extra-ordinary Islamic Research Journal
    of Bangladesh is directed to Salafi Path, based on pure Tawheed and Saheeh Sunnah.
    
    Copyright © মাসিক আত-তাহরীক , Powered By Hadeeth Foundation Bangladesh`,
    links: [
      {
        name: 'Website',
        icon: <FaLink />,
        link: 'https://at-tahreek.com/',
      },
      {
        name: 'Facebook',
        icon: <FaFacebook />,
        link: 'https://www.facebook.com/Monthly.At.tahreek/',
      },
      {
        name: 'YouTube',
        icon: <FaYoutube />,
        link: 'https://www.youtube.com/@AtTahreekTV',
      },
    ],
  },
  {
    number: 2,
    writer: 'Nusus',
    about:
      'কুরআন ও হাদিসের মূল পাঠকে নুসুস (text) বলা হয়। নুসুসের উপর ভিত্তি করেই আমরা লেখালেখি করি।',
    links: [
      {
        name: 'Facebook',
        icon: <FaFacebook />,
        link: 'https://www.facebook.com/FromNusus/',
      },
    ],
  },
];

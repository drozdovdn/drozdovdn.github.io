export type PlatformCategory = 'coding' | 'security';

export interface Platform {
  name: string;
  url: string;
  username: string;
  rank: string;
  stats: string[];
  color: string;
  category: PlatformCategory;
  hasApi: boolean; // Можно ли получить данные через API
  description?: string; // Короткое описание для платформ без API
  visible: boolean; // Показывать ли платформу (для управления отображением)
}

export const platforms: Platform[] = [
  // ==========================================
  // Платформы с API (динамическая статистика)
  // ==========================================
  
  {
    name: 'LeetCode',
    url: 'https://leetcode.com/drozdovdn',
    username: 'drozdovdn',
    category: 'coding',
    hasApi: true,
    visible: true, // Показывать платформу
    rank: 'Knight — Топ 5%',
    stats: [
      '456 задач решено',
      '180 Medium / 42 Hard',
      'Рейтинг контестов: 1847',
      'Рекорд серии: 28 дней',
    ],
    color: '#f59e0b',
  },
  {
    name: 'Codewars',
    url: 'https://www.codewars.com/users/drozdovdn',
    username: 'drozdovdn',
    category: 'coding',
    hasApi: true,
    visible: true,
    rank: '4 kyu — Топ 10%',
    stats: [
      '380+ ката завершено',
      'Честь: 1245',
      'Языки: JavaScript, TypeScript, Python',
      'Фокус: Алгоритмы и структуры данных',
    ],
    color: '#b1361e',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/drozdovdn',
    username: 'drozdovdn',
    category: 'coding',
    hasApi: true,
    visible: true,
    rank: 'Frontend Engineer',
    stats: [
      'Загрузка статистики...',
      'Пожалуйста, подождите',
    ],
    color: '#6366f1',
  },

  // ==========================================
  // Платформы без API (компактные ссылки)
  // ==========================================
  
  {
    name: 'TryHackMe',
    url: 'https://tryhackme.com/p/r00tC0der',
    username: 'r00tC0der',
    category: 'security',
    hasApi: false,
    visible: true,
    description: 'Практическая кибербезопасность и CTF-задачи',
    rank: '',
    stats: [],
    color: '#ef4444',
  },
  {
    name: 'Root Me',
    url: 'https://www.root-me.org/r00tC0der',
    username: 'r00tC0der',
    category: 'security',
    hasApi: false,
    visible: true,
    description: 'Хакерские челленджи и веб-безопасность',
    rank: '',
    stats: [],
    color: '#e8622c',
  },
  {
    name: 'Hack The Box',
    url: 'https://app.hackthebox.com/profile/alexcipher',
    username: 'alexcipher',
    category: 'security',
    hasApi: false,
    visible: false,
    description: 'Penetration Testing и Pro Labs',
    rank: '',
    stats: [],
    color: '#a3e635',
  },
  {
    name: 'PortSwigger Academy',
    url: 'https://portswigger.net/web-security',
    username: 'Security Practitioner',
    category: 'security',
    hasApi: false,
    visible: false,
    description: 'Web Application Security и Burp Suite',
    rank: '',
    stats: [],
    color: '#ff6633',
  },
];

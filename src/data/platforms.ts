export type PlatformCategory = 'coding' | 'security';

export interface Platform {
  name: string;
  url: string;
  username: string;
  color: string;
  category: PlatformCategory;
  hasApi: boolean; // Можно ли получить данные через API (цифры приходят только оттуда)
  description?: string; // Короткое описание / фокус на платформе
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
    description: 'Алгоритмические задачи и контесты',
    color: '#f59e0b',
  },
  {
    name: 'Codewars',
    url: 'https://www.codewars.com/users/drozdovdn',
    username: 'drozdovdn',
    category: 'coding',
    hasApi: true,
    visible: true,
    description: 'Фокус: алгоритмы и структуры данных',
    color: '#b1361e',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/drozdovdn',
    username: 'drozdovdn',
    category: 'coding',
    hasApi: true,
    visible: true,
    description: 'Фокус: frontend-архитектура и производительность',
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
    color: '#ff6633',
  },
];

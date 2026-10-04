export interface NavItem {
  label: string;
  path: string;
  visible: boolean; // Показывать ли пункт в меню
}

export const navItems: NavItem[] = [
  {
    label: 'Главная',
    path: '/',
    visible: true,
  },
  {
    label: 'Опыт',
    path: '/experience/',
    visible: true,
  },
  {
    label: 'Обучение',
    path: '/learning/',
    visible: true,
  },
  {
    label: 'Платформы',
    path: '/platforms/',
    visible: true,
  },
  {
    label: 'Блог',
    path: '/blog/',
    visible: false, // блог отключён; страницы в src/pages/_blog — переименовать обратно в blog, чтобы вернуть
  },
  {
    label: 'Контакты',
    path: '/contact/',
    visible: true,
  },
];

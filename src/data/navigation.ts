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
    visible: false,
  },
  {
    label: 'Контакты',
    path: '/contact/',
    visible: true,
  },
];

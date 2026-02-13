export interface Education {
  institution: string;
  degree: string;
  period: string;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  url?: string;
  description: string;
}

export const education: Education[] = [
  {
    institution: 'АНО ДПО «Образовательные технологии Яндекса»',
    degree: '«Специалист по информационной безопасности: веб-пентест»',
    period: 'февраль 2025 — август 2025',
    description: 'Виды тестирования, классификация уязвимостей и этап разведки. Осноные уязыимости веб-приложений. Основы безопастной разведки веб-приложений. Контейнеризация, Cloud и DevSecOps. Правовые аспекты, документирование и отчетность',
  },
  {
    institution: 'АНО ДПО «Образовательные технологии Яндекса»',
    degree: '«Бэкенд на Node.js для фронтенд-разработчиков»',
    period: 'август 2024 — декабрь 2024',
    description: 'Основы Node, Express и MongoDB. PostgresSQL и Nest.js. Деплой и автоматизация',
  },
  {
    institution: 'АНО ДПО «Образовательные технологии Яндекса»',
    degree: '«Мидл фронтенд-разработчик»',
    period: '2021 — 2022',
    description: 'В рамках курса был написан собственный шаблонизатор и реалиована в рамках командной работы онлайн версия игры "Имаджинариум"',
  },
  {
    institution: 'Ивановский Государственный Энергетический Университет (ИГЭУ)',
    degree: 'Магистр',
    period: '2015 — 2017',
    description: 'Направление: "Управление в технических системах"',
  },
  {
    institution: 'Ивановский Государственный Энергетический Университет (ИГЭУ)',
    degree: 'Бакалавр',
    period: '2011 — 2015',
    description: 'Направление: "Промышленная электроника"',
  },
];

export const certifications: Certification[] = [
  {
    name: 'Сертификат о прохождении обучения по Frontend разраработке',
    issuer: 'Frontend - разработчик',
    year: 'январь-апрель 2020',
    description: 'Прошел обучение в школе Газпромбанка',
  },
];

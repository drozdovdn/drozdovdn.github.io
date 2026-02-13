export interface SkillProject {
  title: string;
  description: string;
  technologies: string[];
  category: 'frontend' | 'backend' | 'security' | 'devops';
}

export const skillProjects: SkillProject[] = [
  {
    title: 'Frontend-архитектура и масштабирование',
    description: '5+ лет разработки enterprise-приложений на React и TypeScript. Веду архитектурное оздоровление: устраняю проблемные зависимости, выстраиваю чистые границы модулей, провожу поэтапный рефакторинг. Разработал и поддерживал библиотеку переиспользуемых UI-компонентов, обеспечивал единый дизайн и консистентность. Настраивал build-процессы (Webpack 4/5, Vite), оптимизировал производительность рендера. Работал с GraphQL, Apollo Client, реализовывал интеграции с API. Опыт с real-time: WebSocket, WebRTC (Kurento Media Server для видеопотоков с IP-камер). Провожу code review с акцентом на типобезопасность, архитектурные решения и предотвращение регрессий.',
    technologies: [
      'React',
      'TypeScript',
      'Next.js',
      'GraphQL',
      'Apollo Client',
      'Webpack',
      'Vite',
      'Storybook',
      'WebRTC',
      'WebSocket',
      'TailwindCSS',
      'Redux/Redux-Saga',
    ],
    category: 'frontend',
  },
  {
    title: 'Backend-разработка на Node.js',
    description: 'Практический опыт работы с Node.js и Express: разработка REST API, настройка серверной части приложений. Прошел курс «Бэкенд на Node.js для фронтенд-разработчиков» — освоил основы Node.js, Express, работу с базами данных MongoDB и PostgreSQL (проектирование схем, оптимизация запросов). Изучил NestJS: модульная архитектура, dependency injection, декораторы, TypeScript-first подход. Получил опыт в деплое приложений и настройке автоматизации развертывания. Понимаю полный цикл разработки от проектирования API до production.',
    technologies: ['Node.js', 'Express', 'NestJS', 'MongoDB', 'PostgreSQL', 'REST API', 'TypeScript'],
    category: 'backend',
  },
  {
    title: 'Веб-безопасность и пентестинг',
    description: 'Прошел комплексный курс веб-безопасности: виды тестирования, классификация уязвимостей, этап разведки. Изучил основные уязвимости веб-приложений (OWASP Top 10): XSS, CSRF, SSRF, SQL/NoSQL-инъекции, недостатки аутентификации и авторизации. Освоил основы безопасной разведки с использованием Burp Suite и других инструментов пентестинга. Получил знания о контейнеризации, Cloud и DevSecOps-практиках. Изучил правовые аспекты, документирование уязвимостей и составление отчетов. Применяю знания безопасности в повседневной разработке: CSP, Security Headers, безопасная работа с JWT.',
    technologies: [
      'OWASP Top 10',
      'Burp Suite',
      'XSS/CSRF/SSRF',
      'SQLi/NoSQLi',
      'Web App Pentesting',
      'Security Headers',
      'CSP',
      'JWT Security',
    ],
    category: 'security',
  },
  {
    title: 'Инфраструктура и DevOps',
    description: 'Изучил на практике работу с Docker и Docker Compose во время курса по бэкенду на Node.js: создание изолированных окружений, контейнеризация приложений, управление multi-container системами. Настраивал DevSecOps на YCloud в рамках курса по веб-безопасности: развертывание инфраструктуры, настройка безопасных конфигураций. Настраивал Nginx как reverse proxy и веб-сервер для production. Работал с CI/CD: GitHub Actions и GitLab CI для автоматизации тестирования и деплоя. Изучил деплой Node.js-приложений и автоматизацию развертывания. Опыт работы с платформами для frontend: Heroku, Netlify. Уверенно работаю в Linux-окружении, настраиваю окружения разработки, пишу bash-скрипты для автоматизации.',
    technologies: [
      'Docker',
      'Docker Compose',
      'YCloud',
      'DevSecOps',
      'Nginx',
      'GitHub Actions',
      'GitLab CI',
      'Heroku/Netlify',
      'Linux/Bash',
    ],
    category: 'devops',
  },
];

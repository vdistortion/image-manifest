import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'image-manifest',
  description: 'Image conversion for static websites',
  base: '/',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  locales: {
    root: {
      label: '🇬🇧 English',
      lang: 'en',
    },
    de: {
      label: '🇩🇪 Deutsch',
      lang: 'de',
      link: '/de/',
      themeConfig: {
        nav: [
          { text: 'Startseite', link: '/de/' },
          { text: 'Dokumentation', link: '/de/docs' },
        ],

        sidebar: [
          {
            text: 'Dokumentation',
            items: [{ text: 'image-manifest', link: '/de/docs' }],
          },
        ],
      },
    },
    ua: {
      label: '🇺🇦 Українська',
      lang: 'ua',
      link: '/ua/',
      themeConfig: {
        nav: [
          { text: 'Головна', link: '/ua/' },
          { text: 'Документація', link: '/ua/docs' },
        ],

        sidebar: [
          {
            text: 'Документація',
            items: [{ text: 'image-manifest', link: '/ua/docs' }],
          },
        ],
      },
    },
    ru: {
      label: '🇷🇺 Русский',
      lang: 'ru',
      link: '/ru/',
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/ru/' },
          { text: 'Документация', link: '/ru/docs' },
        ],

        sidebar: [
          {
            text: 'Документация',
            items: [{ text: 'image-manifest', link: '/ru/docs' }],
          },
        ],
      },
    },
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs' },
    ],

    sidebar: [
      {
        text: 'Docs',
        items: [{ text: 'image-manifest', link: '/docs' }],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vdistortion/image-manifest' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/image-manifest' },
    ],
  },
});

import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'to-static-images',
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
            items: [{ text: 'to-static-images', link: '/de/docs' }],
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
            items: [{ text: 'to-static-images', link: '/ua/docs' }],
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
            items: [{ text: 'to-static-images', link: '/ru/docs' }],
          },
        ],
      },
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs' },
    ],

    sidebar: [
      {
        text: 'Docs',
        items: [{ text: 'to-static-images', link: '/docs' }],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vdistortion/to-static-images' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/to-static-images' },
    ],
  },
});

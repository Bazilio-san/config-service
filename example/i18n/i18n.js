/* eslint-disable import/no-extraneous-dependencies */

const backendI18next = require('i18next-sync-fs-backend');

let i18next = null;

const preload = ['en', 'ru'];

module.exports = () => {
  if (i18next) {
    return i18next;
  }
  i18next = require('i18next');
  i18next
    .use(backendI18next)
    .init({
      load: 'all',
      initImmediate: false, // If set i18next initImmediate option to false it will load the files synchronously
      saveMissing: true,
      debug: process.env.LOGGER_LEVEL === 'silly',
      lng: 'ru',
      preload,
      fallbackLng: 'en', // 'en-us',
      lowerCaseLng: true,
      ns: ['translation', 'cs'],
      defaultNS: 'translation',
      backend: {
        loadPath: `${__dirname}/{lng}/{ns}.json`,
        addPath: `${__dirname}/{ns}.missing.json`,
        jsonIndent: 4
      },
      saveMissingTo: 'all',
      detection: {
        // order and from where user language should be detected
        order: ['querystring', 'cookie', 'header'],

        // keys or params to lookup language from
        lookupQuerystring: 'lng',
        lookupCookie: 'i18next',
        lookupSession: 'lng',
        lookupPath: 'lng',
        lookupFromPathIndex: 0,

        // cache user language
        caches: false // ['cookie']
      },
      interpolation: {
        prefix: '{',
        suffix: '}'
      }
      // eslint-disable-next-line no-unused-vars
    }, () => null);

  preload.forEach((locate) => {
    i18next.changeLanguage(locate);
  });

  return i18next;
};

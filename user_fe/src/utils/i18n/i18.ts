import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLang from "@utils/locales/en/en.json"
import vieLang from "@utils/locales/vie/vie.json"

const resources = {
    en: {
        translation: enLang
    },
    vie: {
        translation: vieLang
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: JSON.parse(window.localStorage.getItem("language") || '"vie"'),
        interpolation: {
            escapeValue: false
        }
    });

export default i18n
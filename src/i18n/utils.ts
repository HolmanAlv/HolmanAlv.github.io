import {ui, defaultLang, type Lang} from './ui';

export function useTranslations(lang: Lang){
    return(key: keyof typeof ui[typeof defaultLang]) =>
        ui[lang][key];
}

export function otherLang(lang: Lang): Lang {
    return lang === 'es' ? 'en' : 'es';
}

export function stripLang(pathname: string): string {
    return pathname.replace(/^\/(es|en)/, '') || '/';
}
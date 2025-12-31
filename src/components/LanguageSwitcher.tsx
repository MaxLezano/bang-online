import { useTranslation } from 'react-i18next';

// Simple SVG Flags
const FlagUS = () => (
    <svg viewBox="0 0 7410 3900" className="w-8 h-6 rounded-sm shadow-md">
        <rect width="7410" height="3900" fill="#b22234" />
        <path d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410" stroke="#fff" strokeWidth="300" />
        <rect width="2964" height="2100" fill="#3c3b6e" />
        <g fill="#fff">
            <g id="s18">
                <g id="s9">
                    <g id="s5">
                        <g id="s4">
                            <path id="s" d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" />
                            <use href="#s" x="494" />
                            <use href="#s" x="988" />
                            <use href="#s" x="1482" />
                            <use href="#s" x="1976" />
                        </g>
                        <use href="#s" x="247" y="210" />
                    </g>
                    <use href="#s5" y="420" />
                    <use href="#s4" y="840" />
                </g>
                <use href="#s9" y="840" />
            </g>
            <use href="#s18" y="420" />
            <use href="#s5" y="1680" />
            <use href="#s" x="247" y="1890" />
        </g>
    </svg>
);

const FlagAR = () => (
    <svg viewBox="0 0 900 600" className="w-8 h-6 rounded-sm shadow-md">
        <rect width="900" height="600" fill="#75aadb" />
        <rect width="900" height="200" y="200" fill="#fff" />
        <g transform="translate(450,300), scale(2.5)">
            <g fill="#f6b40e" stroke="#85340a" strokeWidth="1">
                <circle r="9" />
                <g id="r">
                    <path d="m0-16c-1.5,4-1.5,8 0,10" fill="none" />
                    <path d="m0-16c1.5,4 1.5,8 0,10" fill="none" />
                    <path d="m0-22c-0.5,3 0,6 0,8 1.5,-4 1.5,-6 0,-8" />
                </g>
                <use href="#r" transform="rotate(22.5)" />
                <use href="#r" transform="rotate(45)" />
                <use href="#r" transform="rotate(67.5)" />
                <use href="#r" transform="rotate(90)" />
                <use href="#r" transform="rotate(112.5)" />
                <use href="#r" transform="rotate(135)" />
                <use href="#r" transform="rotate(157.5)" />
                <use href="#r" transform="rotate(180)" />
                <use href="#r" transform="rotate(202.5)" />
                <use href="#r" transform="rotate(225)" />
                <use href="#r" transform="rotate(247.5)" />
                <use href="#r" transform="rotate(270)" />
                <use href="#r" transform="rotate(292.5)" />
                <use href="#r" transform="rotate(315)" />
                <use href="#r" transform="rotate(337.5)" />
            </g>
        </g>
    </svg>
);

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const isActive = (lng: string) => {
        if (lng === 'es') return i18n.resolvedLanguage === 'es' || i18n.resolvedLanguage?.startsWith('es');
        return i18n.resolvedLanguage === lng;
    }

    return (
        <div className="absolute top-4 right-4 flex gap-4">
            <button
                onClick={() => changeLanguage('es')}
                className={`p-1 rounded-md transition-all duration-300 ${isActive('es')
                    ? 'scale-110 ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                    : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                title="Español (Argentina)"
            >
                <FlagAR />
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`p-1 rounded-md transition-all duration-300 ${isActive('en')
                    ? 'scale-110 ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                    : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                title="English (US)"
            >
                <FlagUS />
            </button>
        </div>
    );
};

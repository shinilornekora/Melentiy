import { Lang, translations } from "../assets/translations.js";

function updateTextsToLang(lang: Lang) {
    const t = translations[lang];

    const headerTitle = document.querySelector('header.title');
    if (headerTitle) headerTitle.textContent = t.headerTitle;

    const siDialogH2 = document.querySelector('.si-dialog h2');
    if (siDialogH2) siDialogH2.textContent = t.siDialogTitle;

    const siPlay = document.getElementById('si-play');
    if (siPlay) siPlay.textContent = t.siPlay;

    const siCancel = document.getElementById('si-cancel');
    if (siCancel) siCancel.textContent = t.siCancel;

    const generationModalDesc = document.querySelector('#generationModalDesc');
    if (generationModalDesc) generationModalDesc.textContent = t.generationModalDesc;

    const sectionSubtitle = document.querySelector('section.subtitle');
    if (sectionSubtitle) sectionSubtitle.textContent = t.sectionSubtitle;

    const projectDescription = document.getElementById('projectDescription');
    if (projectDescription) projectDescription.setAttribute('placeholder', t.projectDescriptionPlaceholder);

    const actionButton = document.querySelector('.actionButton');
    if (actionButton) actionButton.setAttribute('value', t.actionButton);

    const historyTitle = document.querySelector('.history-title');
    if (historyTitle) historyTitle.textContent = t.historyTitle;

    const footerGlass = document.querySelector('.footer.glass');
    if (footerGlass) footerGlass.textContent = t.footerGlass;

    const summaryNeon = document.querySelector('summary .neon');
    if (summaryNeon) summaryNeon.textContent = t.summaryNeon;

    const detailsPB = document.querySelector('details p b');
    if (detailsPB) detailsPB.innerHTML = t.detailsPB;
}

export function bootLanguage() {
    const ruBtn = document.getElementById('langBtnRu');
    const enBtn = document.getElementById('langBtnEn');

    if (ruBtn) ruBtn.onclick = () => setLang('ru');
    if (enBtn) enBtn.onclick = () => setLang('en');

    function setLang(lang: Lang) {
        if (ruBtn) ruBtn.classList.toggle('active', lang === 'ru');
        if (enBtn) enBtn.classList.toggle('active', lang === 'en');

        localStorage.setItem('lang', lang);
        updateTextsToLang(lang);
    }

    // Первичная инициализация из localStorage (по умолчанию en)
    const startLang = (localStorage.getItem('lang') as Lang) || 'en';
    setLang(startLang);
}
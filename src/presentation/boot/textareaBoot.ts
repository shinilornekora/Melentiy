import { Lang, translations } from "../assets/translations.js";

export function bootTextarea() {
    // Небольшая анимация на текстареа
    let iter = 0;
    const ta = document.getElementById('projectDescription');

    function animatedPlaceholder() {
        const lang = (localStorage.getItem('lang') as Lang) || 'en';
        const txt = translations[lang].projectDescriptionPlaceholder;

        if (ta) ta.setAttribute('placeholder', txt.substring(0, iter) + (iter % 2 ? '|' : ''));
        iter = (iter + 1) % (txt.length + 1);
        setTimeout(animatedPlaceholder, 75);
    }

    animatedPlaceholder();

    if (ta) {
        ta.addEventListener('focus', function() {
            (this.parentNode?.querySelector('.textarea-border-anim') as HTMLElement)?.classList.add('active');
        });

        ta.addEventListener('blur', function() {
            (this.parentNode?.querySelector('.textarea-border-anim') as HTMLElement)?.classList.remove('active');
        });
    }
}
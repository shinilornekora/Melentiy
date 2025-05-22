import { startSpaceInvaders } from '/scripts/si.js';
import { renderHistory, bindFormHandler } from './scripts/history.js'
import { bindNotification } from "./scripts/notification.js";

// Чтобы пользователь не скучал, пусть поиграет

const form = document.querySelector('.form.glass');
form.addEventListener('submit', function(e) {
    e.preventDefault();

    document.getElementById('si-popup').style.display = 'flex';
    document.getElementById('spaceInvadersCanvas').style.display = 'none';
    document.getElementById('si-dialog').style.display = '';
    document.getElementById('si-over').style.display = 'none';

    document.getElementById('si-cancel').onclick = function() {
        document.getElementById('si-popup').style.display = 'none';
        form.submit();
    };

    document.querySelector('.si-exit').onclick = function() {
        document.getElementById('si-popup').style.display = 'none';
        form.submit();
    };

    document.getElementById('si-play').onclick = function() {
        document.getElementById('si-dialog').style.display = 'none';
        startSpaceInvaders();
        form.submit();
    };

    document.getElementById('si-close').onclick = function() {
        document.getElementById('si-popup').style.display = 'none';
        form.submit();
    }
});

bindFormHandler(form);
bindNotification(form);
renderHistory();


function updateTextsToLang(lang) {
    // Пример: просто переключение заголовка
    document.querySelector('header.title').textContent = lang === 'ru' ? 'Что создадим сегодня?' : 'What will we build today?';
    document.querySelector('.si-dialog h2').textContent = lang == 'ru' ? 'Сыграем в Space Invaders, пока ждёте?' : 'Play Space Invaders while waiting?';
    document.getElementById('si-play').textContent = lang == 'ru' ? 'Сыграть' : 'Play';
    document.getElementById('si-cancel').textContent = lang == 'ru' ? 'Нет, спасибо' : 'Decline';
    document.querySelector('#generationModalDesc').textContent = lang === 'ru' ? 'Генерируем проект...' : 'Generating the project...';
    document.querySelector('section.subtitle').textContent = lang === 'ru' ? 'Нужно выбрать тему проекта.\n' +
        '            Подсветите вещи которые нужно добавить (анимации, инструменты, тд).' : `Choose your project topic.
            Highlight things you want to add (animations, frameworks, etc).`;
    document.getElementById('projectDescription').setAttribute('placeholder', lang === 'ru' ? 'Напишите описание своего проекта здесь...' : 'Write your beautiful theme there...');
    document.querySelector('.actionButton').setAttribute('value', lang === 'ru' ? 'Сгенерировать' : 'Generate');
    document.querySelector('.history-title').textContent = lang === 'ru' ? 'История генераций' : 'Generation history';
    document.querySelector('.footer.glass').textContent = lang === 'ru' ? '© 2025 Верстак Мелентия. Создан по современному стилю искусства.' : '© 2025 Melentiy workbench. Crafted like a piece of art.';
    document.querySelector('summary .neon').textContent = lang === 'ru' ? 'Вот хороший шаблон для идеи!' : `Here's a good template for your idea!`;

    document.querySelector('details p b').innerHTML = lang === 'ru' ? `
        Я хочу создать проект для <mark>...</mark>, <br>
        он должен иметь инструменты или библиотеки такие как <mark>...</mark>,<br>
        и не должен при этом иметь <mark>...</mark>,<br>
        приложение предназначено для <mark>...</mark> пользователей.
    ` : `
        I want to create project for <mark>...</mark>, <br>
        it must have frameworks/libraries like <mark>...</mark>,<br>
        it mustn't have utilities like <mark>...</mark>,<br>
        the app will cover <mark>...</mark> of users.
`
}

const ruBtn = document.getElementById('langBtnRu');
const enBtn = document.getElementById('langBtnEn');

function setLang(lang) {
    ruBtn.classList.toggle('active', lang === 'ru');
    enBtn.classList.toggle('active', lang === 'en');
    localStorage.setItem('lang', lang);
    updateTextsToLang(lang);
}

// Первичная инициализация из localStorage (по умолчанию en)
const startLang = localStorage.getItem('lang') || 'en';
setLang(startLang);

ruBtn.onclick = () => setLang('ru');
enBtn.onclick = () => setLang('en');

// Небольшая анимация на текстареа
let iter = 0;
const ta = document.getElementById('projectDescription');
function animatedPlaceholder() {
    const txt = localStorage.getItem('lang') === 'ru' ? 'Напишите описание своего проекта здесь...' : 'Write your beautiful theme there...';

    ta.placeholder = txt.substring(0, iter) + (iter % 2 ? '|' : '');
    iter = (iter + 1) % (txt.length + 1);
    setTimeout(animatedPlaceholder, 75);
}
animatedPlaceholder();

window.addEventListener("DOMContentLoaded", function() {
    document.body.classList.add("loaded");
});

ta.addEventListener('focus', function() {
    this.parentNode.querySelector('.textarea-border-anim').classList.add('active');
});

ta.addEventListener('blur', function() {
    this.parentNode.querySelector('.textarea-border-anim').classList.remove('active');
});
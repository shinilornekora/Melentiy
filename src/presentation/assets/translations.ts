export type Lang = 'ru' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
    ru: {
        headerTitle: 'Что создадим сегодня?',
        siDialogTitle: 'Сыграем в Space Invaders, пока ждёте?',
        siPlay: 'Сыграть',
        siCancel: 'Нет, спасибо',
        generationModalDesc: 'Генерируем проект...',
        sectionSubtitle: `Нужно выбрать тему проекта.
            Подсветите вещи которые нужно добавить (анимации, инструменты, тд).`,
        projectDescriptionPlaceholder: 'Напишите описание своего проекта здесь...',
        actionButton: 'Сгенерировать',
        historyTitle: 'История генераций',
        footerGlass: '© 2025 Верстак Мелентия. Создан по современному стилю искусства.',
        summaryNeon: 'Вот хороший шаблон для идеи!',
        detailsPB: `Я хочу создать проект для <mark>...</mark>, <br>
        он должен иметь инструменты или библиотеки такие как <mark>...</mark>,<br>
        и не должен при этом иметь <mark>...</mark>,<br>
        приложение предназначено для <mark>...</mark> пользователей.`
    },
    en: {
        headerTitle: 'What will we build today?',
        siDialogTitle: 'Play Space Invaders while waiting?',
        siPlay: 'Play',
        siCancel: 'Decline',
        generationModalDesc: 'Generating the project...',
        sectionSubtitle: `Choose your project topic.
            Highlight things you want to add (animations, frameworks, etc).`,
        projectDescriptionPlaceholder: 'Write your beautiful theme there...',
        actionButton: 'Generate',
        historyTitle: 'Generation history',
        footerGlass: '© 2025 Melentiy workbench. Crafted like a piece of art.',
        summaryNeon: "Here's a good template for your idea!",
        detailsPB: `I want to create project for <mark>...</mark>, <br>
        it must have frameworks/libraries like <mark>...</mark>,<br>
        it mustn't have utilities like <mark>...</mark>,<br>
        the app will cover <mark>...</mark> of users.`
    }
};

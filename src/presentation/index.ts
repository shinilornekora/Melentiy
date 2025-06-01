import { renderHistory } from './widgets/history.js';
import { injectAppStyles } from './assets/styles.js';
import { bootForm } from './boot/formBoot.js';
import { bootTextarea } from './boot/textareaBoot.js';
import { bootLanguage } from './boot/languageBoot.js';

function boot() {
    bootLanguage();
    injectAppStyles();
    bootForm();
    renderHistory();
    bootTextarea();

    window.addEventListener("DOMContentLoaded", function() {
        document.body.classList.add("loaded");
    });
}

boot();
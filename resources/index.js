import { startSpaceInvaders } from '/scripts/si.js';
import { renderHistory, bindFormHandler } from './scripts/history.js'

// Animated placeholder
const txt = "Write your beautiful theme there...";
let iter = 0;
const ta = document.getElementById('projectDescription');
function animatedPlaceholder() {
    ta.placeholder = txt.substring(0, iter) + (iter % 2 ? '|' : '');
    iter = (iter + 1) % (txt.length + 1);
    setTimeout(animatedPlaceholder, 75);
}
animatedPlaceholder();

// Smooth show on page load
window.addEventListener("DOMContentLoaded", function() {
    document.body.classList.add("loaded");
});

// Close textarea border animation
ta.addEventListener('focus', function() {
    this.parentNode.querySelector('.textarea-border-anim').classList.add('active');
});
ta.addEventListener('blur', function() {
    this.parentNode.querySelector('.textarea-border-anim').classList.remove('active');
});

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
renderHistory();


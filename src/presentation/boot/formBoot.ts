import { bindFormHandler } from "../widgets/history.js";
import { bindNotification } from "../widgets/notification.js";
import { startSpaceInvaders } from "../widgets/si.js";

export function bootForm() {
    // Чтобы пользователь не скучал, пусть поиграет
    const form = document.querySelector('.form.glass') as HTMLFormElement | null;

    if (form) {
        form.addEventListener('submit', function(e: Event) {
            e.preventDefault();

            const siPopup = document.getElementById('si-popup');
            const siCanvas = document.getElementById('spaceInvadersCanvas');
            const siDialog = document.getElementById('si-dialog');
            const siOver = document.getElementById('si-over');
            const siCancel = document.getElementById('si-cancel');
            const siPlay = document.getElementById('si-play');
            const siClose = document.getElementById('si-close');
            const siExit = document.querySelector('.si-exit');

            if (siPopup) siPopup.style.display = 'flex';
            if (siCanvas) siCanvas.style.display = 'none';
            if (siDialog) siDialog.style.display = '';
            if (siOver) siOver.style.display = 'none';

            if (siCancel) {
                siCancel.onclick = function() {
                    if (siPopup) siPopup.style.display = 'none';
                    form.submit();
                }
            }

            if (siExit) {
                (siExit as HTMLElement).onclick = function() {
                    if (siPopup) siPopup.style.display = 'none';
                    form.submit();
                }
            }

            if (siPlay) {
                siPlay.onclick = function() {
                    if (siDialog) siDialog.style.display = 'none';
                    startSpaceInvaders();
                    form.submit();
                }
            }

            if (siClose) {
                siClose.onclick = function() {
                    if (siPopup) siPopup.style.display = 'none';
                    form.submit();
                }
            }
        });

        bindFormHandler(form);
        bindNotification(form);
    }
}

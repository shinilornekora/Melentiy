
const generationModal = document.getElementById('generation-modal');
const generationModalDesc = document.getElementById('generationModalDesc');
const spinner = document.querySelector('.generation-modal__spinner');
let modalTimeout = null;

function setSpinner(mode) {
    spinner.className = 'generation-modal__spinner'; // сброс
    if (mode === 'loader' || mode === undefined) {
        spinner.classList.add('loader');
        spinner.innerHTML = ''; // чистим и оставляем как ни было
    } else if (mode === 'check') {
        spinner.classList.add('check');
        spinner.innerHTML = '✅';
    } else if (mode === 'error') {
        spinner.classList.add('error');
        spinner.innerHTML = '❌';
    }
}

function showGenerationModal(msg = 'Генерируем проект...') {
    generationModalDesc.textContent = msg;
    setSpinner('loader');
    generationModal.style.display = 'flex';
}
function finishGeneration(msg = 'Генерация завершена!') {
    generationModalDesc.textContent = msg;
    setSpinner('check');
    clearTimeout(modalTimeout);
    modalTimeout = setTimeout(() => {
        generationModal.style.display = 'none';
        setSpinner('loader'); // вернем спиннер на следующее открытие!
    }, 1400);
}
function errorGeneration(msg = 'Ошибка генерации') {
    generationModalDesc.textContent = msg;
    setSpinner('error');
    clearTimeout(modalTimeout);
    modalTimeout = setTimeout(() => {
        generationModal.style.display = 'none';
        setSpinner('loader');
    }, 1800);
}

const dummyframe = document.getElementById("dummyframe");

export const bindNotification = (form) => {
    if (form) {
        form.addEventListener('submit', function() {
            showGenerationModal("Генерируем проект...");
            clearTimeout(modalTimeout);
            modalTimeout = setTimeout(() => {
                errorGeneration("Что-то пошло не так...");
            }, 15000);
        });
    }
}

if (dummyframe) {
    dummyframe.addEventListener("load", () => {
        finishGeneration("Генерация завершена! 🎉");
    });
}

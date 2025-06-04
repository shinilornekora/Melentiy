const generationModal = document.getElementById('generation-modal') as HTMLDivElement | null;
const generationModalDesc = document.getElementById('generationModalDesc') as HTMLElement | null;
const spinner = document.querySelector('.generation-modal__spinner') as HTMLElement | null;
let modalTimeout: ReturnType<typeof setTimeout> | null = null;

type SpinnerMode = 'loader' | 'check' | 'error' | undefined;

function setSpinner(mode: SpinnerMode): void {
    if (!spinner) return;
    spinner.className = 'generation-modal__spinner'; // сброс
    if (mode === 'loader' || mode === undefined) {
        spinner.classList.add('loader');
        spinner.innerHTML = '';
    } else if (mode === 'check') {
        spinner.classList.add('check');
        spinner.innerHTML = '✅';
    } else if (mode === 'error') {
        spinner.classList.add('error');
        spinner.innerHTML = '❌';
    }
}

export function showGenerationModal(msg: string = 'Генерируем проект...'): void {
    if (!generationModal || !generationModalDesc) return;
    generationModalDesc.textContent = msg;
    setSpinner('loader');
    generationModal.style.display = 'flex';
}

export function finishGeneration(msg: string = 'Генерация завершена!'): void {
    if (!generationModal || !generationModalDesc) {
        return;
    }
    
    generationModalDesc.textContent = msg;
    setSpinner('check');
    
    if (modalTimeout) {
        clearTimeout(modalTimeout);
    }

    modalTimeout = setTimeout(() => {
        if (generationModal) generationModal.style.display = 'none';
        setSpinner('loader');
    }, 1400);
}

export function errorGeneration(msg: string = 'Ошибка генерации'): void {
    if (!generationModal || !generationModalDesc) return;
    generationModalDesc.textContent = msg;
    setSpinner('error');
    if (modalTimeout) clearTimeout(modalTimeout);
    modalTimeout = setTimeout(() => {
        if (generationModal) generationModal.style.display = 'none';
        setSpinner('loader');
    }, 1800);
}

const dummyframe = document.getElementById("dummyframe") as HTMLIFrameElement | null;

export const bindNotification = (form: HTMLFormElement | null): void => {
    if (form) {
        form.addEventListener('submit', function () {
            showGenerationModal("Генерируем проект...");
            if (modalTimeout) clearTimeout(modalTimeout);
            modalTimeout = setTimeout(() => {
                errorGeneration("Что-то пошло не так...");
            }, 1000 * 60 * 5);
        });
    }
};

if (dummyframe) {
    dummyframe.addEventListener("load", () => {
        finishGeneration("Генерация завершена! 🎉");
    });
}

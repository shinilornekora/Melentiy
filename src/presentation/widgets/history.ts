const historyPanel = document.getElementById('history-panel') as HTMLDivElement | null;
const historyToggle = document.getElementById('history-toggle') as HTMLButtonElement | null;
const historyList = document.getElementById('history-list') as HTMLUListElement | null;
const textarea = document.getElementById('projectDescription') as HTMLTextAreaElement | null;

let genHistory: string[] = JSON.parse(localStorage.getItem('generationHistory') || '[]');

export function renderHistory(): void {
    if (!historyList) return;

    historyList.innerHTML = '';
    
    for (let i = 0; i < genHistory.length; ++i) {
        const li = document.createElement('li');
        li.textContent = genHistory[i];
        historyList.appendChild(li);
    }
}

if (historyToggle && historyPanel) {
    historyToggle.onclick = () => {
        historyPanel.classList.toggle('closed');
    }
}

export function bindFormHandler(form: HTMLFormElement): void {
    form.addEventListener('submit', function (_e: Event) {
        if (!textarea) return;

        const val = textarea.value.trim();

        if (val.length > 0) {
            genHistory.push(val);
            if (genHistory.length > 16) {
                genHistory = genHistory.slice(-16);
            }

            renderHistory();
            localStorage.setItem('generationHistory', JSON.stringify(genHistory));
        }
    });
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'h' && historyPanel) {
        historyPanel.classList.toggle('closed');
    }
});

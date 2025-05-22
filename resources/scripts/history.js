const historyPanel = document.getElementById('history-panel');
const historyToggle = document.getElementById('history-toggle');
const historyList = document.getElementById('history-list');
const textarea = document.getElementById('projectDescription');

let genHistory = JSON.parse(localStorage.getItem('generationHistory') || '[]');

export function renderHistory() {
    historyList.innerHTML = '';
    for (let i = 0; i < genHistory.length; ++i) {
        const li = document.createElement('li');
        li.textContent = genHistory[i];
        historyList.appendChild(li);
    }
}

historyToggle.onclick = () => {
    historyPanel.classList.toggle('closed');
}

export function bindFormHandler(form) {
    form.addEventListener('submit', function(e) {
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

window.addEventListener('keydown', (e) => {
    if ((e.altKey || e.ctrlKey) && e.key.toLowerCase()==='h') {
        historyPanel.classList.toggle('closed');
    }
});
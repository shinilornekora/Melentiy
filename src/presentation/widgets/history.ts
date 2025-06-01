type HistoryEntry = {
    id: string;
    content: string;
    created: string;
};

const MAX_HISTORY = 16;

const historyPanel  = document.getElementById('history-panel') as HTMLDivElement | null;
const historyToggle = document.getElementById('history-toggle') as HTMLButtonElement | null;
const historyClearAll = document.getElementById('historyClearBtn') as HTMLButtonElement | null;
const historyList   = document.getElementById('history-list') as HTMLUListElement | null;
const textarea      = document.getElementById('projectDescription') as HTMLTextAreaElement | null;

const historySearch = document.getElementById('history-search') as HTMLInputElement | null;
const historyClear  = document.getElementById('history-clear') as HTMLButtonElement | null;
const historyExport = document.getElementById('history-export') as HTMLButtonElement | null;
const historyImport = document.getElementById('history-import') as HTMLButtonElement | null;
const historyFile   = document.getElementById('history-import-file') as HTMLInputElement | null;

function uuid() {
    return Math.random().toString(36).slice(2,10) + (Date.now()%1e7);
}

let genHistory: HistoryEntry[] = [];
let searchQuery = "";

function loadHistory() {
    try {
        const arr = JSON.parse(localStorage.getItem('generationHistory') || '[]');
        if (Array.isArray(arr) && typeof arr[0] === 'object' && arr[0]?.content) {
            genHistory = arr;
        } else if (Array.isArray(arr)) {
            genHistory = arr.map((str:string) =>
                ({ id: uuid(), content: str, created: new Date().toISOString() })
            );
        } else {
            genHistory = [];
        }
    } catch { genHistory = []; }
}
function saveHistory() {
    localStorage.setItem('generationHistory', JSON.stringify(genHistory));
}

function formatDate(s: string) {
    const d = new Date(s);
    return d.toLocaleString('ru-RU', {day:'2-digit',month:'short',hour:"2-digit",minute:"2-digit"}).replace(/\./g,'');
}

export function renderHistory(): void {
    if (!historyList) return;
    historyList.innerHTML = '';

    let display = genHistory;
    if (searchQuery.length > 0)
        display = display.filter(e => e.content.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!display.length) {
        const li = document.createElement('li');
        li.className = 'history__empty';
        li.textContent = searchQuery ? "Нет совпадений" : "История пуста";
        historyList.appendChild(li);
        return;
    }

    for (let i = display.length-1; i>=0; --i) {
        const entry = display[i];
        const li = document.createElement('li');
        li.className = "history__entry";
        li.tabIndex = 0;
        li.dataset.historyId = entry.id;

        const span = document.createElement('span');
        span.className = 'entry-text';
        let txt = entry.content.length>200 ? entry.content.slice(0,180)+'…' : entry.content;
        if (searchQuery.length > 0) {
            let idx = txt.toLowerCase().indexOf(searchQuery.toLowerCase());
            if (idx >= 0) {
                span.innerHTML = txt.slice(0,idx)+
                        '<mark>'+txt.slice(idx,idx+searchQuery.length)+'</mark>'+txt.slice(idx+searchQuery.length);
            } else {
                span.textContent = txt;
            }
        } else {
            span.textContent = txt;
        }

        const date = document.createElement('span');
        date.className = 'entry-date';
        date.textContent = formatDate(entry.created);

        // actions - удалить
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'entry-del';
        del.title = "Удалить";
        del.textContent = "✖";
        del.onclick = ev => {
            ev.stopPropagation();
            const idx = genHistory.findIndex(e => e.id === entry.id);
            if (idx >= 0) {
                genHistory.splice(idx,1);
                saveHistory();
                renderHistory();
            }
        };

        li.onclick = () => {
            if (textarea) {
                textarea.value = entry.content;
                textarea.focus();
                li.classList.add("copied-anm");
                setTimeout(()=>li.classList.remove("copied-anm"),200);
            }
        };

        const div = document.createElement('div');
        div.className = 'history-entry-container-actions'

        div.append(date, del);
        li.append(span, div);
        historyList.appendChild(li);
    }
}

if (historyToggle && historyPanel) {
    historyToggle.onclick = () => {
        historyPanel.classList.toggle('closed');
        if (!historyPanel.classList.contains('closed')) historySearch?.focus();
    }
}

if (historyClearAll) {
    historyClearAll.onclick = () => {
        localStorage.setItem('generationHistory', JSON.stringify([]));
        genHistory = [];
        saveHistory();
        renderHistory();
    }
}

if (historySearch) historySearch.oninput = function() {
    searchQuery = historySearch.value.trim();
    renderHistory();
};

if (historyClear) historyClear.onclick = () => {
    if (confirm("Очистить всю историю?")) {
        genHistory = [];
        saveHistory();
        renderHistory();
    }
};

if (historyExport) historyExport.onclick = () => {
    const blob = new Blob([JSON.stringify(genHistory,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "generation-history.json";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
};

if (historyImport && historyFile) {
    historyImport.onclick = () => historyFile.click();
    historyFile.onchange = ev=>{
        const file = historyFile.files?.[0];
        if (!file) return;
        file.text().then(txt=>{
            try {
                let imp: any = JSON.parse(txt);
                if (Array.isArray(imp)) {
                    genHistory = imp.slice(-MAX_HISTORY);
                }
                else if (imp.content && typeof imp.content === 'string') {
                    imp.id = imp.id || uuid();
                    genHistory.push(imp); genHistory = genHistory.slice(-MAX_HISTORY);
                }
                else throw "wrong file";
                saveHistory(); renderHistory();
            } catch(e) { alert("Некорректный файл импорта"); }
        })
    }
}

export function bindFormHandler(form: HTMLFormElement): void {
    form.addEventListener('submit', function (_e: Event) {
        if (!textarea) return;
        const val = textarea.value.trim();
        if (val.length > 0) {
            const entry: HistoryEntry = {
                id: uuid(),
                content: val,
                created: new Date().toISOString()
            };
            genHistory.push(entry);
            if (genHistory.length > MAX_HISTORY) {
                genHistory = genHistory.slice(-MAX_HISTORY);
            }
            saveHistory();
            renderHistory();
            // прокрутка к началу
            historyList?.scrollTo({
                top: 0, behavior:
                    'smooth'
            });
        }
    });
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'h' && historyPanel) {
        historyPanel.classList.toggle('closed');
        if (!historyPanel.classList.contains('closed')) historySearch?.focus();
    }
});

window.addEventListener('keydown', e=>{
    if (e.key==="/" && document.activeElement!==historySearch) {
        historySearch?.focus(); e.preventDefault();
    }
});

loadHistory();

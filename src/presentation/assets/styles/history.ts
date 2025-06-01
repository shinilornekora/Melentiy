export const historyStyles = `
    .history-panel {
        position: fixed;
        top: 44px;
        left: 0;
        min-width: 56px;
        width: 320px;
        max-width: 85vw;
        height: 78vh;
        min-height: 248px;
        z-index: 15;
        border-radius: 0 18px 18px 0;
        box-shadow: 3px 0 25px #3a008255;
        transition: width 0.32s cubic-bezier(.5, .6, .23, 1), background 0.26s;
        display: flex;
        flex-direction: column;
        background: rgba(31, 35, 77, 0.79);
        border: 1.5px solid rgba(74, 231, 255, .12);
        backdrop-filter: blur(14px) saturate(1.18);
        -webkit-backdrop-filter: blur(14px) saturate(1.18);
        overflow-x: hidden;
        overflow-y: auto;
    }
    
    .history-panel.closed {
        width: 56px;
        min-width: 56px;
        box-shadow: none;
        background: rgba(22,25,45,0.58);
    }
    
    .history-title {
        margin: 17px 0 8px 69px;
        font-size: 1.11em;
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        color: #97f0fa;
        letter-spacing: 0.04em;
        opacity: .98;
        text-shadow: 0 0 12px #00ffe670, 0 1px 17px #ff92e785;
        transition: opacity .2s;
        user-select: none;
    }
    
    .history-panel.closed .history-title,
    .history-panel.closed .history-list,
    .history-panel.closed #history-search,
    .history-panel.closed .history-actions {
        opacity: 0 !important;
        pointer-events: none;
        height: 0;
    }
    
    .history-toggle {
        position: absolute;
        left: 8px; top: 10px;
        width: 38px; height: 38px;
        border: none;
        border-radius: 50%;
        background: linear-gradient(119deg, #373cffb0 30%, #1df8f67c 100%);
        color: #dffcff;
        font-size: 1.22em;
        box-shadow: 0 2px 31px #81f7e299, 0 1.2px 7px #19e2fb33;
        transition: background .19s;
        cursor: pointer;
        z-index: 2;
        display: flex; align-items: center; justify-content: center;
        outline: none;
    }
    .history-toggle:hover, .history-toggle:focus {
        background: linear-gradient(109deg, #2e43e8d1 13%, #29ffeebc 70%);
    }
    
    .history-list {
        list-style: none;
        padding: 1.25em 1.1em 1em 1.28em;
        margin: 0;
        overflow-y: auto;
        font-family: 'Montserrat', sans-serif;
        font-size: .98em;
        transition: opacity .27s;
        max-height: 58vh;
    }
    
    .history-list li {
        background: rgba(26,34,74,0.70);
        margin-bottom: 12px;
        padding: 9px 15px 9px 12px;
        border-radius: 9px;
        color: #e3f7ff;
        border-left: 4.2px solid #19f6fb;
        font-size: .99em;
        word-break: break-word;
        box-shadow: 0 2px 12px #4aecfa18;
        transition: background .2s, box-shadow .13s;
        display: flex; 
        flex-direction: column;
        align-items: center; 
        gap: .7em;
        cursor: pointer;
        outline: none;
        position: relative;
    }
    
    .history-list li:last-child {
        border-left-color: #e949f7;
        background: #181929ec;
        font-weight: 600;
    }
    
    .history__entry.copied-anm {
        animation: copiedFade 0.5s;
        background: linear-gradient(86deg,#2fffc922 40%,#fafbde55 80%);
    }
    @keyframes copiedFade {
        0%{background: linear-gradient(86deg,#81ffeeac,#f3ffdc);}
        80%{background: linear-gradient(86deg,#1cfad866,#fafbde90);}
        100%{background: rgba(26,34,74,0.70);}
    }
    
    .history__empty {
        color: #b9c3f1cf;
        font-style: italic;
        padding: 1.4em 0 1.8em 0;
        user-select: none;
        opacity: .77;
        text-align: center;
    }
    
    .entry-text {
        flex:1 1 auto;
        white-space: pre-line;
        word-break: break-word;
        font-size: 1em;
    }
    .entry-date {
        margin-left: auto;
        font-size: 11px;
        color: #96c0e6;
        font-family: 'Montserrat',monospace;
        opacity: .82;
        padding-left: 10px;
    }
    
    .entry-del {
        background: none;
        border: none;
        font-size: 1.1em;
        color: #ec77bf;
        opacity: .69;
        margin-left: 5px;
        cursor: pointer;
        border-radius: 50%;
        padding: 2px 7px;
        transition: background .16s, color .15s;
    }
    .entry-del:hover, .entry-del:focus {
        color: #fff;
        background: rgba(219,84,224,0.24);
        opacity: 1;
    }
    
    #history-search {
        width: 93%;
        margin: 0 0 7px 14px;
        padding: 7px 14px 7px 38px;
        border-radius: 13px;
        border: 1.5px solid #28d9ff3b;
        background: rgba(19, 26, 64, 0.80);
        color: #c8e3f7;
        font-size: 1em;
        box-shadow: 0 2px 18px #14dcff0b;
        outline: none;
        transition: border .25s, background .24s;
        position: relative;
        background-image: url('data:image/svg+xml;utf8,<svg fill="skyblue" xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 20 20"><path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l4.38 4.37a1 1 0 1 1-1.42 1.42L12.9 14.32zM8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/></svg>');
        background-repeat: no-repeat;
        background-size: 18px 18px;
        background-position: 12px center;
        padding-left: 38px;
    }
    
    #history-search:focus {
        border-color: #97fbfd;
        background: rgba(29,38,90,0.92);
        color: #fff;
    }
    
    .history-actions {
        margin: 3px 0 0 16px;
        display: flex; gap: 8px;
        opacity: 0.97;
        transition: opacity 0.2s;
    }
    .history-actions button {
        font-size: 1.1em;
        border:none;
        background: #242e66c4;
        padding: 6px 11px;
        border-radius: 9px;
        cursor: pointer;
        color: #80e6ff;
        box-shadow:0 1px 12px #06ffd416;
        transition: background .15s, color .1s;
        font-family: inherit;
    }
    .history-actions button:hover, .history-actions button:focus {
        background: #2afcfb33;
        color: #e95ad9;
    }
    
    #history-import-file {display:none;}
    
    .history-panel::-webkit-scrollbar, .history-list::-webkit-scrollbar {
        width: 0.8em;
        background: linear-gradient(#182032,#252767);
    }
    .history-panel::-webkit-scrollbar-thumb, .history-list::-webkit-scrollbar-thumb {
        background: linear-gradient(97deg, #a8e9ff 40%, #ec92ff 90%);
        border-radius: 10px;
        box-shadow: 0 1.5px 8px #fc96ff5e;
    }
    .history-panel::-webkit-scrollbar-thumb:hover, .history-list::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, #2eeffc, #dc8fff);
    }
    
    @media (max-width:600px) {
        .history-panel { 
            width: 93vw; 
            left: 0; 
            top: 6px; 
            min-height: 120px;
            border-radius: 0 12px 15px 0;
        }
        .history-title { margin-left: 59px;}
    }
    
        .history-clear-btn,
    #history-clear {
        background: linear-gradient(125deg, #1fd4ff80 5%, #c94aff65 94%);
        color: #ffffffcc;
        border: none;
        border-radius: 9px;
        padding: 7px 14px;
        font-size: 1.2em;
        cursor: pointer;
        box-shadow: 0 2px 16px #00ffd533, 0 1px 6px #eb41ff19;
        backdrop-filter: blur(8px) saturate(1.15);
        -webkit-backdrop-filter: blur(8px) saturate(1.15);
        outline: none;
        transition: 
            background .18s cubic-bezier(.7,1,.3,1),
            color .12s,
            box-shadow .22s;
        opacity: .85;
        display: flex;
        align-items: center;
        gap: 0.4em;
    }
    
    .history-clear-btn:hover,
    #history-clear:hover,
    .history-clear-btn:focus,
    #history-clear:focus {
        background: linear-gradient(130deg, #ff4aaf90 0%, #3bfffaa0 95%);
        color: #fff;
        opacity: 1;
        box-shadow: 0 6px 28px 0 #ff79ed2b, 0 1.5px 8px 0 #86fff6aa;
    }
    
    .history-clear-btn:active,
    #history-clear:active {
        background: linear-gradient(126deg, #ff82d2e2 0%, #22ffd6e7 80%);
        color: #0e2b32;
        opacity: 1;
        box-shadow: 0 2px 8px #ff7fd148;
        transform: scale(0.97);
    }
    
    .history-clear-btn {
        position: absolute;
        bottom: 5px;
        width: 95%;
        left: 6px;
        justify-content: center;
    }
    
    .history-panel.closed .history-clear-btn {
        width: min-content;
        left: 2px;
    }
    
    .history-entry-container-actions {
        display: flex;
        align-items: center;
        justify-content: center;
    }
`
export const siStyles = `
    .spaceinvaders-popup {
        position: fixed; z-index: 99999;
        top: 0; left: 0; right: 0; bottom: 0;
        backdrop-filter: blur(3px) brightness(0.7);
        background: #150040c9;
        display: flex; align-items: center; justify-content: center;
        animation: popupfadein .23s;
    }
    
    @keyframes popupfadein { 
        0% { 
            opacity:0;
        } 
        
        100%{
            opacity:1;
        } 
    }

    .si-popup-inner {
        background: #151b3460;
        border-radius: 18px;
        min-width: 340px;
        max-width: 98vw;
        min-height: 180px;
        box-shadow: 0 10px 42px #0009;
        padding: 2em 2.3em;
        position: relative;
        text-align: center;
    }

    .si-popup-inner h2 {
        font-family: 'Orbitron', sans-serif;
        color: #00fdfa;
    }

    .si-dialog__actions {
        margin-top: 1.2em;
        display: flex; justify-content: center; gap: 1em;
    }
    
    .si-exit {
        position: absolute;
        right: 10px;
        top: 5px;
        background: transparent;
        font-size: 2em; line-height: 1;
        border: none; color: #fff;
        cursor: pointer;
        filter: drop-shadow(0 0 9px #ff2afbbb);
        z-index: 1;
    }

    #spaceInvadersCanvas {
        margin-top: 1em;
        background: linear-gradient(to bottom,#18198f 70%,#790065 110%);
        border: 3px solid #00fff2bf;
        box-shadow: 0 0 32px #00fff255;
        display: block;
    }
`
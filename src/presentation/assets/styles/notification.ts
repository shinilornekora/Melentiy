export const notificationStyles = `
    .generation-modal {
        position: fixed;
        top: 30px;
        right: 36px;
        z-index: 9999;
        background: rgba(28,19,44, 0.9);
        border-radius: 16px;
        box-shadow: 0 4px 24px #5af9fa23;
        padding: 1.1em 2.2em 1.1em 1.6em;
        min-width: 180px;
        min-height: 66px;
        display: flex;
        align-items: center;
        gap: 0.7em;
        animation: genModalIn .18s;
        border: 1.5px solid #2afcfb6e;
    }

    @keyframes genModalIn {
        0% { 
            opacity: 0;
            transform: translateY(-16px) scale(.97); 
        }
        100% {
            opacity:1; 
            transform: none;
        }
    }
        
    .generation-modal__body {
        display: flex; align-items: center; gap: 1.15em;
    }

    .generation-modal__spinner {
        width: 36px; height: 36px;
        margin-right: 0.7em;
        display: flex; align-items: center; justify-content: center;
        font-size: 28px;
        transition: color .18s, opacity .22s;
    }

    .generation-modal__spinner.loader {
        border: 3.5px solid #5bfaff52;
        border-top: 3.5px solid #e660f8;
        border-radius: 50%;
        width: 36px; height: 36px;
        animation: spinGen 0.8s linear infinite;
        content: '';
        box-sizing: border-box;
    }

    @keyframes spinGen {
        0% { 
            transform: rotate(0deg);
        }
        100% { 
            transform: rotate(360deg);
        }
    }

    .generation-modal__spinner.check {
        border: none;
        animation: none;
        color: #79fda8;
        font-size: 34px;
        background: none;
        width: 36px;
        height: 36px;
        display: flex; align-items: center; justify-content: center;
    }

    .generation-modal__spinner.error {
        border: none;
        animation: none;
        color: #ff668a;
        font-size: 34px;
        background: none;
    }

    .generation-modal__desc {
        color: #f2faff;
        font-family: 'Orbitron', sans-serif;
        font-size: 1em;
        letter-spacing: 0.02em;
    }
`
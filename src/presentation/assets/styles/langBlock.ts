export const langBlockStyles = `
    .lang-switch {
        position: fixed;
        right: 30px;
        bottom: 26px;
        z-index: 10000;
        background: rgba(28,19,44, 0.93);
        border: 1.5px solid #2afcfb6e;
        border-radius: 14px;
        box-shadow: 0 2px 18px #5af9fa16;
        padding: 7px 14px;
        display: flex;
        gap: 7px;
        align-items: center;
        user-select: none;
    }

    .lang-switch__btn {
        background: none;
        border: none;
        color: #f2faff;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        font-size: 16px;
        padding: 3px 11px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.15s, color 0.13s;
        outline: none;
        opacity: 0.7;
    }

    .lang-switch__btn.active, .lang-switch__btn:focus {
        background: #2afcfb33;
        color: #09f1c6;
        opacity: 1;
    }
`
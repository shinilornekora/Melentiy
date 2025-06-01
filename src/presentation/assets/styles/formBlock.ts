export const formStyles = `
    .wrapper {
        min-height: 98vh;
        width: 96vw; 
        max-width: 960px;
        box-shadow: 0 8px 32px 6px rgba(54,64,125,.17);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 46px;
        justify-content: center;
        margin: 2vw auto;
        position:relative;
        z-index: 1;
        transition: box-shadow .7s;
    }

    .title {
        width: 100%;
        font-family: 'Orbitron', 'Montserrat', 'Trebuchet MS', sans-serif;
        text-align: center;
        font-size: clamp(2.7rem, 7vw, 6rem);
        letter-spacing: 0.07em;
        font-weight: 900;
        padding-top: 1.4vw;
        margin-bottom: -1.2vw;
        color: #e8f2ff;
        filter: drop-shadow(0 0 16px #12f5ff66);
        text-shadow: 0 0 20px #00ffff84, 0 6px 24px #2de9fb29, 0 -1px 3px #fff2;
        animation: neonpulse 3.5s ease-in-out infinite alternate;
    }
    
    .title:focus {
        outline: none;
        box-shadow: 0 0 0 3px #30fcee62;
    }

    @keyframes neonpulse {
        0% {
            text-shadow: 0 0 8px #21e4ff8c, 0 6px 34px #f7f8ff22;
        }
        
        45% {
            text-shadow: 0 0 30px #00f0ff88, 0 16px 46px #48fff566;
        }
        
        100% {
            text-shadow: 0 0 24px #10d7ecb9, 0 6px 16px #1fffff62;
        }
    }

    .subtitle {
        font-size: clamp(1.1rem, 2vw, 1.55em);
        font-weight: 400;
        color: #fbe4ff;
        letter-spacing:0.01em;
        opacity: 0.98;
        padding: 0.6rem 2.4vw;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 28px 0 rgba(222, 216, 255, 0.04);
        margin-bottom: -1vw;
        transition: background .6s;
        animation: fadeinsection 2.5s .4s cubic-bezier(.35,1,.41,1.18) both;
    }
    
    @keyframes fadeinsection {
        0% {
            opacity: 0;
            transform: translateY(30px) scale(.93);
        }
        
        100% {
            opacity: .98;
            transform: none;
        }
    }

    .form {
        margin: 0 auto;
        width: 100%;
        gap: 28px;
        background: rgba(25,20,32,0.34);
        padding: 2vw 3vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 24px;
        box-shadow: 0 10px 32px -8px #103a5920;
        position:relative;
        transition: box-shadow .5s;
        border: 1.2px solid rgba(173, 221, 255, 0.09);
    }

    .textarea-wrapper {
        position:relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .topic {
        font-family: 'Montserrat', monospace, sans-serif;
        font-size: 1.08rem;
        smin-width: 220px;
        height: 33vh; min-height: 120px; max-height: 360px;
        color: #f5faff;
        background: linear-gradient(107deg, rgba(24,17,39,0.93), rgba(27,46,70,0.76) 70%);
        border: 2.5px solid #3ee7fff0;
        border-radius: 22px;
        box-shadow: 0 12px 64px -18px #14e2f921, 0 4px 14px 0 #117cbb16;
        padding: 20px 18px 20px 18px;
        outline: none;
        margin-right: 0;
        margin-bottom: 0;
        resize: vertical;
        caret-color: #11ffff;
        letter-spacing: 0.02em;
        line-height: 1.55;
        transition:
                box-shadow .23s cubic-bezier(.7,.1,.2,1.12),
                border .33s cubic-bezier(.55,0,.72,1.36),
                color .17s;
        overflow-y: auto;
    }

    .topic:focus {
        background: linear-gradient(107deg, rgba(25,26,42,0.98), rgba(23,66,98,0.79) 65.1%);
        border-color: #26f1f5d5;
        color: #fff7fa;
        box-shadow: 0 0 0 4px #00fff8c6, 0 8px 34px 2px #17e2f928;
    }

    .topic::placeholder {
        color: #bad5ffbb;
        letter-spacing: 0.03em;
        font-style: italic;
        opacity: 0.9;
    }

    .textarea-border-anim {
        content:'';
        position: absolute;
        inset: 0;
        border-radius: 22px;
        pointer-events: none;
        z-index: 2;
        border: 0 solid transparent;
        transition: border 0.7s cubic-bezier(.57,1.34,.52,.97);
        box-shadow: none;
    }

    .textarea-border-anim.active {
        border: 2.5px solid #91eaff;
        box-shadow: 0 0 24px #8edbffe9, 0 0 72px #09e2ff33;
        animation: textarea-outline-blink .9s cubic-bezier(.8,0,.17,1.2) 1;
    }

    @keyframes textarea-outline-blink {
        0% {
            box-shadow:0 0 0 0 #00fff363;
        }
        75% {
                box-shadow:0 0 18px 6px #3afcff55;
        }
        100% {
            box-shadow:0 0 22px 0 #18e6f544;
        }
    }

    .actionButton {
        margin-top: .6vw;
        position: relative;
        font-family: 'Orbitron', 'Montserrat', sans-serif;
        font-weight: bold;
        font-size: 1.38rem;
        color: #232118;
        letter-spacing:0.09em;
        text-shadow: 0 0 5px #fff4,
            0 0 10px #9ae1ff,
            0 3px 5px #bae5ff22;
        background: linear-gradient(91deg, #24ffe1 0%, #2e5cff 100%);
        border: none;
        box-shadow:
                0 7px 29px -8px #10e9ff90,
                0 1.8px 8px 0 #9ffbff33;
        border-radius: 17px;
        padding: 15px 45px;
        cursor: pointer;
        outline: none;
        overflow: hidden;
        transition:
                background 340ms cubic-bezier(.7,.1,.2,1.12),
                color 420ms cubic-bezier(.7,.09,.18,1),
                box-shadow 350ms cubic-bezier(.5,.07,.42,1.69),
                transform 120ms cubic-bezier(.87,.03,.12,1.02);
        }

    .actionButton:hover, .actionButton:focus {
        background: linear-gradient(91deg, #ff80fa 0%, #24ffe1 100%);
        color: #1c0065;
        box-shadow:
                0 0 30px 5px #12ffff66,
                0 18px 70px -7px #ec69ff33,
                0 3.8px 24px 2px #ec7cff24;
        transform: scale(1.044);
        animation: btnshadowglw 0.7s cubic-bezier(.54,1.45,.11,1) 1;
    }
    
    @keyframes btnshadowglw {
        0% {
            box-shadow:0 0 0 0 #97deff77; }
        70% {
            box-shadow:0 0 32px 12px #b5daf782;
        }
        100% {
            box-shadow:0 0 38px 6px #c0fcff6c;
        }
    }
        
    .actionButton:active {
        transform: scale(.97) translateY(1.8px);
        box-shadow:
                0 3px 14px #50fceebb,
                0 0.5px 6px 0 #ec92ff29;
        background: linear-gradient(89deg, #53ffc5 0%, #ffb8e4 100%);
    }

    details.details {
        width: 97%;
        max-width: 900px;
        margin: 0 auto 60px auto;
        border-radius: 20px;
        background: rgba(255,255,255,0.06);
        padding: 1.4rem 2.7vw 1.3rem 2vw;
        box-shadow: 0 1px 22px #eef91e05;
        color: #f9eaff;
        font-size: 1.07rem;
        cursor: pointer;
        border: none;
        position:relative;
        overflow: hidden;
        letter-spacing:0.018em;
        transition:
                box-shadow 0.45s cubic-bezier(.6,1.5,.1,1),
                background .64s cubic-bezier(.61,.39,.65,1.25);
    }

    details.details[open] {
        background: rgba(255,255,255,0.22);
        box-shadow: 0 0 48px 5px #24d3d237, 0 6px 9px -2px #4fc3ff3c;
        color: #32213a;
        animation: detailsshadowfade 0.8s cubic-bezier(.27,1.16,.74,1.1);
    }

    @keyframes detailsshadowfade {
        from {
            box-shadow: 0 0 60px #00e8ff66;
        }
        to {
            box-shadow: 0 0 48px 5px #24d3d237;
        }
    }

    details.details[open] p {
        color: #211c20;
        background: rgba(255,255,255,0.10);
        border-radius: 9px;
        padding: 0.22em .6em;
        box-shadow: 0 2px 9px #ff92e712;
    }

    details.details summary {
        font-size: 1.12em;
        font-weight: bolder;
        position: relative;
        cursor: pointer;
        color: #7bfff8;
        text-shadow: 0 0 6px #b8ffe4a6, 0 0 2px #fff6;
        transition: color .12s, text-shadow .27s;
        outline: none;
        border: none;
        margin-bottom:.6em;
        filter: drop-shadow(0 2px 2px #0dffe144);
    }

    details.details summary::-webkit-details-marker {
        display: none;
    }

    details.details summary:before {
        content: "🔒";
        margin-right: 0.6em;
        font-size: 1.1em;
        filter: drop-shadow(0 0 7px #fb7fff9c);
        animation: lockglow 2.5s cubic-bezier(.3,.93,.5,1.1) infinite alternate;
    }

    @keyframes lockglow {
        0% {
            filter: drop-shadow(0 0 5px #fff6)
        }
        100% {
            filter: drop-shadow(0 0 16px #ff93fb99)
        }
    }

    details.details[open] summary:before {
        content: "✅";
        color: #b9ff9a;
        filter: drop-shadow(0 0 15px #9affa5);
    }

    .details p mark  {
        background: linear-gradient(93deg, #b3fffc88, #f5baff88 71%, #fcfb7f88);
        color: #143e45;
        padding: .04em .18em;
        border-radius: 4px;
        font-style:italic;
    }
    
    .details p {
        font-size: 1.03rem;
    }

    .neon, .neon-glow {
        filter: drop-shadow(0 0 14px #00fdff92);
    }

    .neon {
        color: #90ffe3;
        text-shadow: 0 0 6px #00f0ff70, 0 1px 8px #ff92e7cc;
    }

    .footer {
        font-size: 1.08rem;
        width: 100%;
        position: absolute;
        bottom: 0;
        padding: 1.1em 1.5em 1.5em 0;
        text-align: right;
        color: #e0e8f8c5;
        letter-spacing: .058em;
        border-top: 1px solid #2a4455c2;
        margin-top: 2vw;
        border-radius: 0 0 19px 19px;
        opacity: .84;
        background: rgba(40,42,90,0.14);
        box-shadow: 0 0 0 transparent;
    }

    .fade-in {
        animation: fadeinsection 2.5s .13s both;
    }

    .slide-in {
        animation: slideinblock .95s .35s cubic-bezier(.45,1,.45,1.09) both;
    }

    @keyframes slideinblock {
        0% {
            opacity:0;transform:translateY(30px) scale(.97);
        }
        100% {
            opacity:1;transform:none;
        }
    }

    ::-webkit-scrollbar {
        width: 0.8em;
        background: linear-gradient(#080b1d, #1a1e36);
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(97deg, #a8e9ff 40%, #ec92ff 90%);
        border-radius: 22px;
        box-shadow: 0 2px 16px #fb96ffc8;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, #33f6f7, #ec8fff);
    }

    textarea {
        width: 100%;
    }

    textarea::-webkit-scrollbar-thumb {
        background: #53ffc5b5;
    }

    textarea::-webkit-scrollbar-thumb:hover {
        background: #ff92e7b2;
    }

    @media (max-width: 730px){
        .wrapper {
            max-width: calc(99vw - 8px);
        }

        .topic {
            width:96vw;
            max-width:99vw;
            min-width:90vw;
        }
        
        .form {
            padding: 7vw 2vw;
            border-radius:14px;
        }
        
        .footer {
            font-size:.98rem;
        }
        
        .details {
            font-size:.97rem;
        }
    }

    @media (max-width: 480px) {
        .title {
            font-size: 9vw;
        }

        .subtitle {
            font-size: 1.05rem;
        }

        .topic {
            height: 20vh;
        }

        .wrapper {
            gap: 16px;
        }
            
        .footer {
                font-size:.89rem;
        }
            
        .form {
                border-radius:8px;
        }
            
        details.details {
            padding: 1.1rem 2vw;
        }
    }

    :focus-visible {
        outline: 2.5px solid #00fff5;
        outline-offset: 1.3px;
    }
`
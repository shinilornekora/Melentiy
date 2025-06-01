export const globalStyles = `
        *, *::before, *::after {
        box-sizing: border-box;
        margin:0;
        padding:0;
    }

    html, body {
        height: 100%;
        min-height: 100%;
    }

    body {
        min-height: 100vh;
        width: 100vw;
        overflow-x: hidden;
        font-family: 'Montserrat', Arial, Helvetica, sans-serif;
        background: #111;
        color: #fcfdff;
        position: relative;
        transition: background 1s cubic-bezier(.9,0,.1,1);
    }

    body.loaded {
        background: #101020;
    }

    .bg-blob {
        position: fixed;
        top: -10vw;
        left: -15vw;
        width: 55vw;
        height: 50vw;
        z-index: 0;
        pointer-events: none;
        filter: blur(70px) brightness(0.88) saturate(1.7);
        background: radial-gradient(circle at 60% 40%, #a8f1ff 0%, #3995ec 60%, #6b56ce 85%, transparent 100%);
        opacity: 0.6;
        animation: floatblob 42s cubic-bezier(.65,.06,.3,1) infinite alternate;
        transition: opacity .5s;
    }

    .bg-blob.second {
        top: 60vh;
        left: 65vw;
        width: 45vw;
        height: 49vw;
        background: radial-gradient(circle at 50% 60%, #ff92e7 0%, #e5f265 40%, #53ffc5 99%, transparent 100%);
        opacity: 0.47;
        filter: blur(80px) brightness(0.95) saturate(1.4);
        animation: floatblob2 56s cubic-bezier(.35,.1,.75,1) infinite alternate;
    }

    @keyframes floatblob {
        from {
            transform:translate(0,0) scale(1.2);
        }
        61% {
            transform:translate(12vw,10vh) scale(1.08);
        }
        95%,to {
            transform:translate(-20vw,13vh) scale(1.28);
        }
    }

    @keyframes floatblob2 {
        from {
            transform:translate(0,0) scale(1);
        }
        38% {
            transform:translate(7vw,-4vw) scale(.98);
        }
        67% {
            transform:translate(-12vw,-20vh) scale(1.2);
        }

        to {
            transform: translate(-10vw,-16vw) scale(1.07);
        }
    }
    
    .glass {
        background: rgba(35, 36, 84, 0.56);
        border: 1.5px solid rgba(255,255,255,.16);
        box-shadow: 0 8px 64px 8px rgba(61,142,255,0.09), 0 1.5px 12px 0 rgba(255,255,255,.052);
        border-radius: 30px;
        backdrop-filter: blur(10px) saturate(1.33);
        -webkit-backdrop-filter: blur(10px) saturate(1.33);
    }
    
`;
// Лёгкая реализация игры для ожидания генерации проекта
export function startSpaceInvaders() {
    const cvs = document.getElementById('spaceInvadersCanvas');
    const ctx = cvs.getContext('2d');
    cvs.style.display = 'block';
    let W = cvs.width, H = cvs.height;

    const player = { x: W/2-18, y: H-38, w: 36, h: 15, dx: 0 };
    const shots = [];
    const enemyShots = [];
    let enemies = [];
    let rows = 3, cols = 8, eW = 28, eH = 18, eGap = 13;
    let enemyDx = 1.3, enemyDy = 19, enemySpeed = 60, enemyFrame = 0, dir = 1; // направление
    let score = 0;
    let playing = true;

    function resetEnemies() {
        enemies = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                enemies.push({
                    x: 28 + c * (eW + eGap),
                    y: 38 + r * (eH + eGap),
                    w: eW, h: eH, alive: true
                });
            }
        }
    }
    resetEnemies();

    let left = false, right = false, space = false, canShoot = true;

    function key(e, d) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            left = d;
        }
        else if (e.code === 'ArrowRight'||e.code === 'KeyD') {
            right = d;
        }
        else if (e.code === 'Space') {
            space = d;
        }
        e.preventDefault();
    }
    window.addEventListener('keydown', e => key(e, true));
    window.addEventListener('keyup',   e => key(e, false));

    function drawPlayer() {
        ctx.save();
        ctx.fillStyle = '#00fff2';
        ctx.beginPath();
        ctx.rect(player.x, player.y, player.w, player.h-7);
        ctx.rect(player.x+10, player.y-7, player.w-20, 7); // башня
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
    }

    function drawEnemy(e) {
        ctx.save();
        ctx.fillStyle = '#f9ec33';
        ctx.beginPath();
        ctx.roundRect(e.x, e.y, e.w, e.h, 6);
        ctx.shadowColor = "#fff927bb";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#16132e';
        ctx.beginPath();
        ctx.arc(
            e.x + e.w * 0.28,
            e.y+e.h*0.61,
            2,
            0,
            7);
        ctx.arc(
            e.x + e.w * 0.72,
            e.y + e.h*0.61,
            2,
            0,
            7
        );
        ctx.fill();
    }

    function render() {
        ctx.clearRect(0,0,W,H);

        drawPlayer();

        ctx.save();
        ctx.strokeStyle = "#00fa8b";
        for (let s of shots) {
            ctx.strokeRect(s.x-1, s.y, 2, 10);
        }

        ctx.restore();
        ctx.save();
        ctx.strokeStyle = "#ff2a99";

        for (let s of enemyShots) {
            ctx.strokeRect(s.x-1, s.y, 2, 9);
        }

        ctx.restore();

        for (let e of enemies) {
            if(e.alive) {
                drawEnemy(e);
            }
        }

        ctx.save();
        ctx.font = "bold 18px Orbitron,Arial,sans-serif";
        ctx.fillStyle = "#fff";
        ctx.shadowColor="#50fff7cc";
        ctx.shadowBlur=7;
        ctx.fillText("Score: "+score, 14, 29);
        ctx.restore();
    }

    function update() {
        player.dx = (left?-3:0) + (right?3:0);
        player.x += player.dx;

        if (player.x < 8) {
            player.x = 8;
        }

        if (player.x > W-8-player.w) {
            player.x = W-8-player.w;
        }

        if (space && canShoot) {
            canShoot = false;
            shots.push({
                x: player.x + player.w/2,
                y: player.y - 11,
                vy: -6
            });
            setTimeout(()=>canShoot=true, 280);
        }

        for (let i=shots.length-1; i>=0; i--) {
            shots[i].y += shots[i].vy;
            for (let e of enemies) if(e.alive) {
                if (
                    shots[i].x > e.x && shots[i].x < e.x+e.w &&
                    shots[i].y > e.y && shots[i].y < e.y+e.h
                ) {
                    e.alive = false;
                    score += 11;
                    shots.splice(i,1);
                    i--;
                    break;
                }
            }
            if(i >= 0 && shots[i] && shots[i].y < 0) {
                shots.splice(i,1);
            }
        }

        enemyFrame++;
        if (enemyFrame % enemySpeed === 0) {
            let edge = false;
            for (let e of enemies) if (e.alive) {
                if ((dir==1 && e.x+e.w+3>=W-4) ||
                    (dir==-1 && e.x-3<=4) ) edge = true;
            }
            for (let e of enemies) if (e.alive) {
                e.x += dir * enemyDx * 7;
            }
            if (edge) {
                dir *= -1;
                for (let e of enemies) if (e.alive) e.y += enemyDy;
                enemySpeed = Math.max(10, enemySpeed-5);
            }
        }

        // Враги стреляют иногда (рандом)
        if(Math.random() < 0.013 + score/2000) {
            let bottomRow = {};
            for (let e of enemies) {
                if (e.alive) {
                    let key = Math.round(e.x);
                    if (!bottomRow[key] || e.y > bottomRow[key].y) {
                        bottomRow[key] = e;
                    }
                }
            }
            let arr= Object.values(bottomRow);
            if (arr.length) {
                let shooter = arr[Math.floor(Math.random() * arr.length)];
                enemyShots.push({
                    x: shooter.x+shooter.w / 2,
                    y: shooter.y+shooter.h,
                    vy: 3.3
                });
            }
        }
        for(let i=enemyShots.length-1;i>=0;i--) {
            let s = enemyShots[i];
            s.y += s.vy;
            // Попал ли в игрока?
            // Сложно нормально декомпозировать
            if (
                s.x > player.x && s.x < player.x+player.w &&
                s.y > player.y && s.y < player.y + player.h
            ) {
                playing = false;
            }
            if(s.y>H+20) enemyShots.splice(i,1);
        }

        // Победа — переигрывать волну
        if(enemies.every(e => !e.alive)) {
            rows = Math.min(6,rows+1);
            resetEnemies();
            enemyDx+=0.31;
            enemyDy+=1.7;
            score+=30;
            enemySpeed = Math.max(9, enemySpeed-8);
        }

        // Проигрыш: дошли до низа
        for (let e of enemies) {
            if (e.alive && e.y+e.h>player.y-2) {
                playing = false;
            }
        }
    }

    function gameLoop() {
        if (!playing) {
            cancelAnimationFrame(gameLoopId);
            gameOver();
            return;
        }

        update();
        render();
        gameLoopId = requestAnimationFrame(gameLoop);
    }
    let gameLoopId = requestAnimationFrame(gameLoop);

    cvs.tabIndex = 1; cvs.focus();

    playing = true;
    score = 0;
    rows=3;
    enemyDx=1.3;
    enemyDy=19;
    enemySpeed=60;
    resetEnemies();
    shots.length=0;
    enemyShots.length=0;

    function gameOver() {
        setTimeout(() => {
            document.getElementById('spaceInvadersCanvas').style.display = 'none';
            document.getElementById('si-over').style.display = 'block';
            document.getElementById('si-score').textContent = score;
        }, 400);
    }
}
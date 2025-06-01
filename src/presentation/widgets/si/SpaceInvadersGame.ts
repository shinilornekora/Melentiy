import { GameConfig } from "./GameConfig.js";
import { Enemy, Explosion, Player, Powerup, Shield, Shot } from "./types";

export class SpaceInvadersGame {
    cvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    W: number;
    H: number;
    player: Player;
    shots: Shot[];
    enemyShots: Shot[];
    enemies: Enemy[];
    shields: Shield[];
    powerups: Powerup[];
    explosions: Explosion[];
    rows: number;
    cols: number;
    eW: number;
    eH: number;
    eGap: number;
    enemyDx: number;
    enemyDy: number;
    enemySpeed: number;
    enemyFrame: number;
    dir: number;
    score: number;
    playing: boolean;
    left: boolean;
    right: boolean;
    space: boolean;
    canShoot: boolean;
    gameLoopId: number | null;
    keyDownHandler: (e: KeyboardEvent) => void;
    keyUpHandler: (e: KeyboardEvent) => void;
    level: number;
    stats: { shotsFired: number, enemiesKilled: number, powerupsTaken: number};

    snd_shot: HTMLAudioElement;
    snd_explosion: HTMLAudioElement;
    snd_powerup: HTMLAudioElement;
    snd_lost: HTMLAudioElement;

    constructor() {
        const canvas = document.getElementById('spaceInvadersCanvas') as HTMLCanvasElement | null;

        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        this.cvs = canvas;
        const context = this.cvs.getContext('2d');

        if (!context) {
            throw new Error('2D context not supported');
        }

        this.ctx = context;
        this.cvs.style.display = 'block';
        this.W = this.cvs.width;
        this.H = this.cvs.height;

        // Веселее играть со звуком
        this.snd_shot = new Audio("resources/audio/shot.mp3");
        this.snd_shot.volume = 0.21;
        this.snd_explosion = new Audio("resources/audio/explosion.mp3");
        this.snd_explosion.volume = 0.15;
        this.snd_powerup = new Audio("resources/audio/powerup.mp3");
        this.snd_powerup.volume = 0.24;
        this.snd_lost = new Audio("resources/audio/lost.mp3");
        this.snd_lost.volume = 0.12;

        this.player = {
            x: this.W / 2 - GameConfig.PLAYER_WIDTH / 2,
            y: this.H - 38,
            w: GameConfig.PLAYER_WIDTH,
            h: GameConfig.PLAYER_HEIGHT,
            dx: 0,
            lives: GameConfig.PLAYER_LIVES,
            multiShot: false,
            multiShotTimer: 0,
            speedBoost: false,
            speedBoostTimer: 0,
        };
        this.shots = [];
        this.enemyShots = [];
        this.enemies = [];
        this.shields = [];
        this.powerups = [];
        this.explosions = [];
        this.rows = GameConfig.ROWS_INITIAL;
        this.cols = GameConfig.COLS_INITIAL;
        this.eW = GameConfig.ENEMY_WIDTH;
        this.eH = GameConfig.ENEMY_HEIGHT;
        this.eGap = GameConfig.ENEMY_GAP;
        this.enemyDx = GameConfig.ENEMY_DX_INITIAL;
        this.enemyDy = GameConfig.ENEMY_DY_INITIAL;
        this.enemySpeed = GameConfig.ENEMY_SPEED_INITIAL;
        this.enemyFrame = 0;
        this.dir = 1;
        this.score = 0;
        this.playing = true;
        this.left = false;
        this.right = false;
        this.space = false;
        this.canShoot = true;
        this.gameLoopId = null;
        this.level = 1;
        this.stats = { shotsFired: 0, enemiesKilled: 0, powerupsTaken: 0 };

        this.keyDownHandler = (e: KeyboardEvent) => this.key(e, true);
        this.keyUpHandler = (e: KeyboardEvent) => this.key(e, false);

        this.bindEvents();

        this.cvs.tabIndex = 1;
        this.cvs.focus();

        this.resetGameState();
        this.gameLoop();
    }

    bindEvents(): void {
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
    }

    unbindEvents(): void {
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
    }

    resetEnemies(): void {
        this.enemies = [];
        // На каждом пятом уровне появляется босс в центре
        if (this.level % 5 === 0) {
            let boss: Enemy = {
                x: this.W / 2 - 80,
                y: 40,
                w: 160,
                h: 64,
                alive: true,
                boss: true,
                hp: 16 + Math.floor(this.level / 2),
            };
            this.enemies.push(boss);
        } else {
            for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
                for (let colIndex = 0; colIndex < this.cols; colIndex++) {
                    const enemyX = GameConfig.ENEMY_X_OFFSET + colIndex * (this.eW + this.eGap);
                    const enemyY = GameConfig.ENEMY_Y_OFFSET + rowIndex * (this.eH + this.eGap);
                    this.enemies.push({
                        x: enemyX, y: enemyY,
                        w: this.eW, h: this.eH,
                        alive: true
                    });
                }
            }
        }
    }

    resetShields(): void {
        this.shields = [];
        // Генерируем 4 щита
        let shieldW = 50, shieldH = 20;
        for(let si=0; si<4; ++si){
            let sw = shieldW, sh = shieldH;
            let sx = 80 + si*(this.W-160)/3, sy = this.H-100;
            this.shields.push({ x: sx, y: sy, w: sw, h: sh, health: 10 });
        }
    }

    key(e: KeyboardEvent, d: boolean): void {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            this.left = d;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            this.right = d;
        } else if (e.code === 'Space') {
            this.space = d;
        }
        e.preventDefault();
    }

    drawPlayer(): void {
        const p = this.player;
        const ctx = this.ctx;

        ctx.save();
        ctx.fillStyle = GameConfig.PLAYER_COLOR;
        ctx.beginPath();
        ctx.rect(p.x, p.y, p.w, p.h - GameConfig.PLAYER_TOWER_HEIGHT);
        ctx.rect(p.x + 10, p.y - GameConfig.PLAYER_TOWER_HEIGHT, p.w - 20, GameConfig.PLAYER_TOWER_HEIGHT);
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 12 + (p.speedBoost ? 8 : 0);
        ctx.globalAlpha = p.multiShot ? 0.79 : 1;
        ctx.fill();
        ctx.restore();

        // отрисовать жизни
        for(let l=0; l<p.lives-1; ++l){
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = "#6bcf7e";
            ctx.fillRect(20 + l*19, this.H-30, 15, 10);
            ctx.restore();
        }
    }

    drawEnemy(e: Enemy): void {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = e.boss ? "#ff6259" : GameConfig.ENEMY_COLOR;
        ctx.beginPath();
        // @ts-ignore
        ctx.roundRect(e.x, e.y, e.w, e.h, e.boss ? 25 : GameConfig.ENEMY_CORNER_RADIUS);
        ctx.shadowColor = e.boss ? "#fa5" : GameConfig.ENEMY_SHADOW_COLOR;
        ctx.shadowBlur = e.boss ? 35 : GameConfig.ENEMY_SHADOW_BLUR;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = GameConfig.ENEMY_EYE_COLOR;
        ctx.beginPath();
        ctx.arc(
            e.x + e.w * GameConfig.ENEMY_EYE_LEFT_X, e.y + e.h * GameConfig.ENEMY_EYE_Y,
            GameConfig.ENEMY_EYE_RADIUS * (e.boss? 2 :1), 0, 7
        );
        ctx.arc(
            e.x + e.w * GameConfig.ENEMY_EYE_RIGHT_X, e.y + e.h * GameConfig.ENEMY_EYE_Y,
            GameConfig.ENEMY_EYE_RADIUS*(e.boss ? 2:1), 0, 7
        );
        ctx.fill();
        ctx.restore();

        // HP бар босса
        if(e.boss && e.alive && e.hp){
            ctx.save();
            let perc = e.hp / (16 + Math.floor(this.level/2));
            ctx.fillStyle = "#fa5";
            ctx.fillRect(e.x, e.y-6, e.w * perc, 5);
            ctx.restore();
        }
    }

    drawShields(){
        const ctx = this.ctx;
        for(let sh of this.shields){
            if(sh.health > 0){
                ctx.save();
                ctx.globalAlpha = 0.76;
                ctx.fillStyle = "#84cefe";
                ctx.fillRect(sh.x, sh.y, sh.w, sh.h);
                ctx.fillStyle = "#1163b3";
                ctx.globalAlpha = Math.max(0.2, sh.health/10);
                ctx.fillRect(sh.x, sh.y+sh.h-5, sh.w, 5);
                ctx.restore();
            }
        }
    }

    drawPowerups() {
        const ctx = this.ctx;
        for(const p of this.powerups){
            if (!p.active) continue;
            ctx.save();
            ctx.globalAlpha = 0.85;
            if(p.kind === "life")      ctx.fillStyle = "#6bcf7e";
            else if(p.kind === "multiShot") ctx.fillStyle = "#e0c43c";
            else                      ctx.fillStyle = "#97b3fd";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 14, 0, 2*Math.PI);
            ctx.fill();
            ctx.restore();
            // рисуем иконку
            ctx.save();
            ctx.fillStyle = "#222";
            ctx.font = "14px monospace"
            ctx.textAlign = "center";
            ctx.fillText(p.kind === "life" ? "♥️" : p.kind === "multiShot" ? "≡" : "⮕", p.x, p.y+5);
            ctx.restore();
        }
    }

    drawExplosions(){
        const ctx = this.ctx;
        for(const ex of this.explosions){
            ctx.save();
            ctx.globalAlpha = Math.max(0,1 - ex.frame/18);
            ctx.fillStyle = ex.color;
            ctx.beginPath();
            ctx.arc(ex.x, ex.y, 18-ex.frame, 0, 2*Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    render(): void {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        this.drawPlayer();

        this.drawShields();
        this.drawPowerups();
        this.drawExplosions();

        ctx.save();
        ctx.strokeStyle = GameConfig.SHOT_COLOR;
        for (let s of this.shots) {
            ctx.strokeRect(s.x - 1, s.y, GameConfig.SHOT_WIDTH, GameConfig.PLAYER_SHOT_HEIGHT);
        }
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = GameConfig.ENEMY_SHOT_COLOR;
        for (let s of this.enemyShots) {
            ctx.strokeRect(s.x - 1, s.y, GameConfig.SHOT_WIDTH, GameConfig.ENEMY_SHOT_HEIGHT);
        }
        ctx.restore();

        for (let e of this.enemies) {
            if (e.alive) {
                this.drawEnemy(e);
            }
        }

        ctx.save();
        ctx.font = GameConfig.SCORE_FONT;
        ctx.fillStyle = GameConfig.SCORE_COLOR;
        ctx.shadowColor = GameConfig.SCORE_SHADOW_COLOR;
        ctx.shadowBlur = GameConfig.SCORE_SHADOW_BLUR;
        ctx.fillText("Score: " + this.score, GameConfig.SCORE_X, GameConfig.SCORE_Y);
        ctx.font = "18px monospace";
        ctx.fillStyle = "rgba(220,220,250,0.85)";
        ctx.shadowBlur = 0;
        ctx.fillText("Level: " + this.level, 20, 32);
        ctx.restore();
    }

    update(): void {
        // === Игрок движение/бафы ===
        let speed = this.player.speedBoost ? GameConfig.PLAYER_SPEED*2 : GameConfig.PLAYER_SPEED;
        this.player.dx = (this.left ? -speed:0) + (this.right ? speed:0);
        this.player.x += this.player.dx;

        if (this.player.x < GameConfig.CANVAS_LEFT_PADDING) this.player.x = GameConfig.CANVAS_LEFT_PADDING;
        if (this.player.x > this.W - GameConfig.CANVAS_RIGHT_PADDING - this.player.w)
            this.player.x = this.W - GameConfig.CANVAS_RIGHT_PADDING - this.player.w;

        // ---- Powerup эффекты по времени ---
        if(this.player.multiShot){
            this.player.multiShotTimer--;
            if(this.player.multiShotTimer<=0)
                this.player.multiShot = false;
        }
        if(this.player.speedBoost){
            this.player.speedBoostTimer--;
            if(this.player.speedBoostTimer<=0)
                this.player.speedBoost = false;
        }
        // ---- Стрельба player ----
        if (this.space && this.canShoot) {
            this.canShoot = false;
            this.stats.shotsFired++;
            this.snd_shot.currentTime = 0; this.snd_shot.play();

            if(this.player.multiShot) {
                for(let i of [-1,0,1]){
                    this.shots.push({
                        x: this.player.x + this.player.w / 2 + i*11,
                        y: this.player.y - 11, vy: GameConfig.PLAYER_SHOT_SPEED
                    });
                }
            }else{
                this.shots.push({
                    x: this.player.x + this.player.w / 2,
                    y: this.player.y - 11,
                    vy: GameConfig.PLAYER_SHOT_SPEED
                });
            }
            setTimeout(() => this.canShoot = true, GameConfig.PLAYER_SHOT_DELAY);
        }

        // === Игрок vs Powerup ===
        for(const p of this.powerups){
            if(!p.active) continue;
            if(Math.abs(p.x - (this.player.x+this.player.w/2)) < 25
                && Math.abs(p.y - (this.player.y+this.player.h/2)) < 28){
                this.stats.powerupsTaken++; this.snd_powerup.currentTime=0; this.snd_powerup.play();
                if(p.kind==="life") this.player.lives++;
                if(p.kind==="multiShot") {
                    this.player.multiShot=true;
                    this.player.multiShotTimer=240;
                }
                if(p.kind==="speed") {
                    this.player.speedBoost=true;
                    this.player.speedBoostTimer=160;
                }
                p.active=false;
            }
        }

        // === Движение powerups ===
        for(const p of this.powerups){
            if(p.active){
                p.y += p.vy;
                if(p.y > this.H+20) p.active=false;
            }
        }

        // === Щиты (коллизии с выстрелами) ===
        for (let si=0;si<this.shields.length;++si){
            const sh = this.shields[si];
            if(sh.health <= 0) continue;
            // Игрок бьёт shield
            for (let i = this.shots.length - 1; i >= 0; i--) {
                const s = this.shots[i];
                if (
                    s.x > sh.x && s.x < sh.x + sh.w &&
                    s.y > sh.y && s.y < sh.y + sh.h
                ) {
                    this.shots.splice(i,1);
                    if(sh.health) sh.health--;
                }
            }
            // Враг стреляет по shield
            for (let i = this.enemyShots.length - 1; i >= 0; i--) {
                const es = this.enemyShots[i];
                if (
                    es.x > sh.x && es.x < sh.x + sh.w &&
                    es.y > sh.y && es.y < sh.y + sh.h
                ) {
                    this.enemyShots.splice(i,1);
                    if(sh.health) sh.health--;
                }
            }
        }

        // === Выстрелы игрока ===
        for (let i = this.shots.length - 1; i >= 0; i--) {
            this.shots[i].y += this.shots[i].vy;
            for (let e of this.enemies) if (e.alive) {
                if (
                    this.shots[i].x > e.x && this.shots[i].x < e.x + e.w &&
                    this.shots[i].y > e.y && this.shots[i].y < e.y + e.h
                ) {
                    // Если это босс - уходит hp, иначе убит сразу
                    if(e.boss){
                        if(e.hp!==undefined && e.hp>1){
                            e.hp--;
                            this.explosions.push({
                                x: this.shots[i].x,
                                y: this.shots[i].y, frame:0, color:"#fff"
                            });
                        } else {
                            e.alive = false;
                            this.explosions.push({
                                x:e.x+e.w/2, y:e.y+e.h/2, frame:0, color:"#f56"
                            });
                            this.score += 200+this.level*77;
                            this.stats.enemiesKilled++;
                        }
                    }else{
                        e.alive = false;
                        this.explosions.push({
                            x:e.x+e.w/2, y:e.y+e.h/2, frame:0, color:"#cff"
                        });
                        this.score += 10 + this.level*3;
                        this.stats.enemiesKilled++;
                        // С некой вероятностью появляется powerup
                        if(Math.random()<0.13+0.01*this.level){
                            let kinds: Powerup['kind'][] = ["life","multiShot","speed"];
                            this.powerups.push({
                                x: e.x+e.w/2, y:e.y+e.h/2,
                                vy: 1.3+0.1*this.level, active:true,
                                kind: kinds[Math.floor(Math.random()*kinds.length)],
                            });
                        }
                    }
                    this.shots.splice(i, 1);
                    i--;
                    this.snd_explosion.currentTime=0; this.snd_explosion.play();
                    break;
                }
            }
            if (i >= 0 && this.shots[i] && this.shots[i].y < 0) {
                this.shots.splice(i, 1);
            }
        }

        // === Анимация взрывов ===
        for(let i=this.explosions.length-1;i>=0;i--){
            this.explosions[i].frame++;
            if(this.explosions[i].frame>18)
                this.explosions.splice(i,1);
        }

        // === Движение врагов ===
        this.enemyFrame++;
        if (this.enemyFrame % this.enemySpeed === 0) {
            let edge = false;
            for (let e of this.enemies) if (e.alive) {
                if ((this.dir == 1 && e.x + e.w + 3 >= this.W - 4) ||
                    (this.dir == -1 && e.x - 3 <= 4)) edge = true;
            }
            for (let e of this.enemies) if (e.alive) {
                e.x += this.dir * this.enemyDx * 7;
            }
            if (edge) {
                this.dir *= -1;
                for (let e of this.enemies) if (e.alive) e.y += this.enemyDy;
                this.enemySpeed = Math.max(10, this.enemySpeed - 5);
            }
        }

        // === Враг стреляет ===
        // шанс выстрела зависит от уровня и оставшихся врагов
        let fireChance = 0.013 + this.score / 150000 + this.level*0.001;
        if (Math.random() < fireChance) {
            const bottomRow: { [key: string]: Enemy } = {};
            for (let e of this.enemies) {
                if (e.alive) {
                    let key = Math.round(e.x).toString();
                    if (!bottomRow[key] || e.y > bottomRow[key].y) {
                        bottomRow[key] = e;
                    }
                }
            }
            let arr = Object.values(bottomRow);
            if (arr.length) {
                let shooter = arr[Math.floor(Math.random() * arr.length)];
                this.enemyShots.push({
                    x: shooter.x + shooter.w / 2,
                    y: shooter.y + shooter.h,
                    vy: GameConfig.ENEMY_SHOT_SPEED+this.level*0.15
                });
            }
        }

        // === Выстрелы врага ===
        for (let i = this.enemyShots.length - 1; i >= 0; i--) {
            let shot = this.enemyShots[i];
            shot.y += shot.vy;

            // попал по щиту (уже обрабатывалось выше)
            // попал по игроку
            const hitX = shot.x >= this.player.x && shot.x <= this.player.x + this.player.w;
            const hitY = shot.y >= this.player.y && shot.y <= this.player.y + this.player.h;

            if (hitX && hitY) {
                this.player.lives--;
                this.snd_explosion.currentTime=0; this.snd_explosion.play();
                this.explosions.push({
                    x: this.player.x+this.player.w/2,
                    y: this.player.y, frame:0, color:"#ff6"
                });
                this.enemyShots.splice(i,1);
                if (this.player.lives<=0) {
                    this.playing = false;
                }
            } else if (shot.y > this.H + 20) {
                this.enemyShots.splice(i, 1);
            }
        }

        // === Новая волна (победа) ===
        if (this.enemies.every(e => !e.alive)) {
            this.rows = Math.min(GameConfig.ROWS_MAX, this.rows + (this.level<5 ? 1 : 0));
            this.level++;
            this.resetEnemies();
            this.enemyDx += GameConfig.ENEMY_DX_INCREMENT;
            this.enemyDy += GameConfig.ENEMY_DY_INCREMENT;
            this.score += 200;
            this.enemySpeed = Math.max(GameConfig.ENEMY_SPEED_MIN, this.enemySpeed - GameConfig.ENEMY_SPEED_DECREASE);
            // рестарт бафов и powerups
            this.powerups.length=0;
            this.resetShields();
        }

        // === Проигрыш: враги дошли до игрока ===
        for (let e of this.enemies) {
            if (e.alive && e.y + e.h > this.player.y - 2) {
                this.playing = false;
            }
        }
    }

    gameLoop(): void {
        if (!this.playing) {
            if (this.gameLoopId !== null) cancelAnimationFrame(this.gameLoopId);
            this.snd_lost.currentTime=0; this.snd_lost.play();
            this.gameOver();
            this.unbindEvents();
            return;
        }
        this.update();
        this.render();
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    resetGameState(): void {
        this.playing = true;
        this.score = 0;
        this.level = 1;
        this.rows = GameConfig.ROWS_INITIAL;
        this.enemyDx = GameConfig.ENEMY_DX_INITIAL;
        this.enemyDy = GameConfig.ENEMY_DY_INITIAL;
        this.enemySpeed = GameConfig.ENEMY_SPEED_INITIAL;
        this.resetEnemies();
        this.resetShields();
        this.shots.length = 0;
        this.enemyShots.length = 0;
        this.powerups.length = 0;
        this.player.lives = GameConfig.PLAYER_LIVES;
        this.player.multiShot = false;
        this.player.speedBoost = false;
        this.player.multiShotTimer = 0;
        this.player.speedBoostTimer = 0;
        this.stats = { shotsFired:0, enemiesKilled:0, powerupsTaken: 0 };
    }

    gameOver(): void {
        setTimeout(() => {
            const canvas = document.getElementById('spaceInvadersCanvas') as HTMLCanvasElement | null;
            const siOver = document.getElementById('si-over') as HTMLElement | null;
            const siScore = document.getElementById('si-score') as HTMLElement | null;
            if (canvas) canvas.style.display = 'none';
            if (siOver) siOver.style.display = 'block';
            if (siScore) siScore.innerHTML = `
                <div>Счёт: <b>${this.score}</b></div>
                <div>Уровень: <b>${this.level}</b></div>
                <div>Выстрелов: <b>${this.stats.shotsFired}</b></div>
                <div>Убито врагов: <b>${this.stats.enemiesKilled}</b></div>
                <div>Взято бонусов: <b>${this.stats.powerupsTaken}</b></div>
            `;
        }, 400);
    }
}
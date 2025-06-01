import { GameConfig } from "./GameConfig.js";

interface Player {
    x: number;
    y: number;
    w: number;
    h: number;
    dx: number;
}

interface Shot {
    x: number;
    y: number;
    vy: number;
}

interface Enemy {
    x: number;
    y: number;
    w: number;
    h: number;
    alive: boolean;
}

export class SpaceInvadersGame {
    cvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    W: number;
    H: number;
    player: Player;
    shots: Shot[];
    enemyShots: Shot[];
    enemies: Enemy[];
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

    constructor() {
        const canvas = document.getElementById('spaceInvadersCanvas') as HTMLCanvasElement | null;
        if (!canvas) throw new Error('Canvas element not found');

        this.cvs = canvas;
        const context = this.cvs.getContext('2d');
        if (!context) throw new Error('2D context not supported');

        this.ctx = context;
        this.cvs.style.display = 'block';
        this.W = this.cvs.width;
        this.H = this.cvs.height;

        this.player = {
            x: this.W / 2 - GameConfig.PLAYER_WIDTH / 2,
            y: this.H - 38,
            w: GameConfig.PLAYER_WIDTH,
            h: GameConfig.PLAYER_HEIGHT,
            dx: 0
        };
        this.shots = [];
        this.enemyShots = [];
        this.enemies = [];
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
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            for (let colIndex = 0; colIndex < this.cols; colIndex++) {
                const enemyX = GameConfig.ENEMY_X_OFFSET + colIndex * (this.eW + this.eGap);
                const enemyY = GameConfig.ENEMY_Y_OFFSET + rowIndex * (this.eH + this.eGap);
                this.enemies.push({
                    x: enemyX,
                    y: enemyY,
                    w: this.eW,
                    h: this.eH,
                    alive: true
                });
            }
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
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
    }

    drawEnemy(e: Enemy): void {
        const ctx = this.ctx;

        ctx.save();
        ctx.fillStyle = GameConfig.ENEMY_COLOR;
        ctx.beginPath();
        // @ts-ignore: roundRect is not in all Canvas types, but is present in all modern browsers
        ctx.roundRect(e.x, e.y, e.w, e.h, GameConfig.ENEMY_CORNER_RADIUS);
        ctx.shadowColor = GameConfig.ENEMY_SHADOW_COLOR;
        ctx.shadowBlur = GameConfig.ENEMY_SHADOW_BLUR;
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = GameConfig.ENEMY_EYE_COLOR;
        ctx.beginPath();
        ctx.arc(
            e.x + e.w * GameConfig.ENEMY_EYE_LEFT_X,
            e.y + e.h * GameConfig.ENEMY_EYE_Y,
            GameConfig.ENEMY_EYE_RADIUS, 0, 7
        );
        ctx.arc(
            e.x + e.w * GameConfig.ENEMY_EYE_RIGHT_X,
            e.y + e.h * GameConfig.ENEMY_EYE_Y,
            GameConfig.ENEMY_EYE_RADIUS, 0, 7
        );
        ctx.fill();
    }

    render(): void {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        this.drawPlayer();

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
        ctx.restore();
    }

    update(): void {
        // === Игрок ===
        this.player.dx = (this.left ? -GameConfig.PLAYER_SPEED : 0)
            + (this.right ? GameConfig.PLAYER_SPEED : 0);
        this.player.x += this.player.dx;

        if (this.player.x < GameConfig.CANVAS_LEFT_PADDING) {
            this.player.x = GameConfig.CANVAS_LEFT_PADDING;
        }
        if (this.player.x > this.W - GameConfig.CANVAS_RIGHT_PADDING - this.player.w) {
            this.player.x = this.W - GameConfig.CANVAS_RIGHT_PADDING - this.player.w;
        }

        if (this.space && this.canShoot) {
            this.canShoot = false;
            this.shots.push({
                x: this.player.x + this.player.w / 2,
                y: this.player.y - 11,
                vy: GameConfig.PLAYER_SHOT_SPEED
            });
            setTimeout(() => this.canShoot = true, GameConfig.PLAYER_SHOT_DELAY);
        }

        // === Выстрелы игрока ===
        for (let i = this.shots.length - 1; i >= 0; i--) {
            this.shots[i].y += this.shots[i].vy;
            for (let e of this.enemies) if (e.alive) {
                if (
                    this.shots[i].x > e.x && this.shots[i].x < e.x + e.w &&
                    this.shots[i].y > e.y && this.shots[i].y < e.y + e.h
                ) {
                    e.alive = false;
                    this.score += 11;
                    this.shots.splice(i, 1);
                    i--;
                    break;
                }
            }
            if (i >= 0 && this.shots[i] && this.shots[i].y < 0) {
                this.shots.splice(i, 1);
            }
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
        if (Math.random() < 0.013 + this.score / 200000) {
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
                    vy: GameConfig.ENEMY_SHOT_SPEED
                });
            }
        }

        // === Выстрелы врага ===
        for (let i = this.enemyShots.length - 1; i >= 0; i--) {
            let shot = this.enemyShots[i];
            shot.y += shot.vy;

            const hitX = shot.x >= this.player.x && shot.x <= this.player.x + this.player.w;
            const hitY = shot.y >= this.player.y && shot.y <= this.player.y + this.player.h;

            if (hitX && hitY) {
                this.playing = false;
            }

            if (shot.y > this.H + 20) {
                this.enemyShots.splice(i, 1);
            }
        }

        // === Новая волна (победа) ===
        if (this.enemies.every(e => !e.alive)) {
            this.rows = Math.min(GameConfig.ROWS_MAX, this.rows + 1);
            this.resetEnemies();
            this.enemyDx += GameConfig.ENEMY_DX_INCREMENT;
            this.enemyDy += GameConfig.ENEMY_DY_INCREMENT;
            this.score += 300;
            this.enemySpeed = Math.max(GameConfig.ENEMY_SPEED_MIN, this.enemySpeed - GameConfig.ENEMY_SPEED_DECREASE);
        }

        // === Проигрыш: враги дошли до уровня игрока ===
        for (let e of this.enemies) {
            if (e.alive && e.y + e.h > this.player.y - 2) {
                this.playing = false;
            }
        }
    }

    gameLoop(): void {
        if (!this.playing) {
            if (this.gameLoopId !== null) cancelAnimationFrame(this.gameLoopId);
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
        this.rows = GameConfig.ROWS_INITIAL;
        this.enemyDx = GameConfig.ENEMY_DX_INITIAL;
        this.enemyDy = GameConfig.ENEMY_DY_INITIAL;
        this.enemySpeed = GameConfig.ENEMY_SPEED_INITIAL;
        this.resetEnemies();
        this.shots.length = 0;
        this.enemyShots.length = 0;
    }

    gameOver(): void {
        setTimeout(() => {
            const canvas = document.getElementById('spaceInvadersCanvas') as HTMLCanvasElement | null;
            const siOver = document.getElementById('si-over') as HTMLElement | null;
            const siScore = document.getElementById('si-score') as HTMLElement | null;
            if (canvas) canvas.style.display = 'none';
            if (siOver) siOver.style.display = 'block';
            if (siScore) siScore.textContent = this.score.toString();
        }, 400);
    }
}
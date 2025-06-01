export interface Player {
    x: number;
    y: number;
    w: number;
    h: number;
    dx: number;
    lives: number;
    multiShot: boolean;
    multiShotTimer: number;
    speedBoost: boolean;
    speedBoostTimer: number;
}

export interface Shot {
    x: number;
    y: number;
    vy: number;
}

export interface Enemy {
    x: number;
    y: number;
    w: number;
    h: number;
    alive: boolean;
    boss?: boolean;
    hp?: number;
}

export interface Shield {
    x: number;
    y: number;
    w: number;
    h: number;
    health: number;
}

export interface Powerup {
    x: number;
    y: number;
    vy: number;
    kind: "life" | "multiShot" | "speed";
    active: boolean;
}

export interface Explosion {
    x: number;
    y: number;
    frame: number;
    color: string;
}
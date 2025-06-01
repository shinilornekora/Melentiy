// Чтобы не было магических чисел и чтобы было легче настраивать игру
export class GameConfig {
    static ENEMY_WIDTH = 28;
    static ENEMY_HEIGHT = 18;
    static ENEMY_GAP = 13;
    static ENEMY_X_OFFSET = 28;
    static ENEMY_Y_OFFSET = 38;

    // Границы для игрока
    static PLAYER_WIDTH = 36;
    static PLAYER_HEIGHT = 15;
    static PLAYER_TOWER_HEIGHT = 7;
    static PLAYER_COLOR = '#00fff2';

    // Шаги и скорости
    static PLAYER_SPEED = 3;
    static PLAYER_SHOT_SPEED = -6;
    static ENEMY_SHOT_SPEED = 3.3;
    static ENEMY_DX_INITIAL = 1.3;
    static ENEMY_DY_INITIAL = 19;
    static ENEMY_SPEED_INITIAL = 60;

    // Ограничения количества строк и прироста
    static ROWS_INITIAL = 3;
    static COLS_INITIAL = 8;
    static ROWS_MAX = 6;
    static ENEMY_DX_INCREMENT = 0.31;
    static ENEMY_DY_INCREMENT = 1.7;
    static ENEMY_SPEED_MIN = 9;
    static ENEMY_SPEED_DECREASE = 8;

    // Прочие параметры отрисовки и взаимодействия
    static ENEMY_CORNER_RADIUS = 6;
    static ENEMY_COLOR = '#f9ec33';
    static ENEMY_SHADOW_COLOR = "#fff927bb";
    static ENEMY_SHADOW_BLUR = 8;
    static ENEMY_EYE_COLOR = '#16132e';
    static ENEMY_EYE_RADIUS = 2;
    static ENEMY_EYE_LEFT_X = 0.28;
    static ENEMY_EYE_RIGHT_X = 0.72;
    static ENEMY_EYE_Y = 0.61;

    static SHOT_WIDTH = 2;
    static PLAYER_SHOT_HEIGHT = 10;
    static ENEMY_SHOT_HEIGHT = 9;
    static SHOT_COLOR = "#00fa8b";
    static ENEMY_SHOT_COLOR = "#ff2a99";
    static CANVAS_LEFT_PADDING = 8;
    static CANVAS_RIGHT_PADDING = 8;

    static SCORE_FONT = "bold 18px Orbitron, Arial,sans-serif";
    static SCORE_COLOR = "#fff";
    static SCORE_SHADOW_COLOR = "#50fff7cc";
    static SCORE_SHADOW_BLUR = 7;
    static SCORE_X = 14;
    static SCORE_Y = 29;

    static PLAYER_SHOT_DELAY = 280; // ms
}
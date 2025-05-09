/**
 * Ограничиваем сценарии для нейросети.
 * Иначе нейросеть начнет генерировать что попало.
 */
export type ARCH_TYPE = 'fsd' | 'module' | 'microfronts' | 'clean' | 'ddd';
export type BundlerType = 'webpack' | 'rollup' | 'vite';

/**
 * Манифестируем формат общения с инфраструктурным слоем.
 */
export type Message = {
    role: string,
    text: string
};

/**
 * Все настройки проекта которые когда либо будут определены.
 */
export type Settings = {
    A_TYPE: ARCH_TYPE;
    P_NAME: string;
    DEPS: string;
    builder: 'webpack' | 'rollup' | 'vite';
    transpilerDeps: string[];
}

/**
 * Не тип из-за рекурсивности.
 * Смотри error TS2456: Type alias 'Structure' circularly references itself.
 */
export interface Structure {
    [key: string]: string | string[] | Structure;
}

export type Project = {
    /**
     * Пока заглушка.
     * Нужно избавиться от кейсов где так обращаться вообще можно.
     */
    [key: string]: Structure;
    settings: Settings;
    structure: Structure | Project;
}

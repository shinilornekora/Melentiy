type Props = {
    deps: string;
}

export function getRelevantBundler({ deps }: Props) {
    return `
        I need to get relevant bundler for my project.
        It has dependencies: ${ deps }
        Please provide ONLY the format answer.
        Your response should follow this format:
        
        BUILDER: <BUILDER_DEPENDENCIES>

        Choose BUILDER from the following options:
            - webpack
            - rollup
            - vite

        **ANSWER FORMAT EXAMPLES**:
        - webpack: chunks-webpack-plugin,html-webpack-plugin
        - vite: @vitejs/plugin-vue,@vitejs/plugin-vue-jsx

        **NO ANY EXPLICIT TEXT IN RESPONSE.**
    `;
}

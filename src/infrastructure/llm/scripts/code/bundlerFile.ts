type Props = {
    bundler: string;
    bundlerPlugins: string;
};

export function getBundlerFileScript({ bundler, bundlerPlugins }: Props) {
    return `
        Your task: write a JS config file for the ${bundler} bundler in a JavaScript application.
        The config file must include the following plugins: ${bundlerPlugins}.
    
        Rules:
        1. Output ONLY JavaScript code (no markdown, no extra text).
        2. Use ALL plugins listed above. Do not add plugins beyond ${bundlerPlugins}.
        3. Always apply the latest ${bundler} syntax.
        4. Remember to define the entrypoint for the application.
        5. If something is a loader (not a plugin), put it under the module/rules section.
        6. contentBase has been renamed to static (use it accordingly).
        7. For Webpack, include html-webpack-plugin, and note index.html is in ./public.
        
        Notes:
        • Add a few comments for clarity.
        • DO NOT write anything besides the JS config.
        • Keep loaders and plugins separated correctly.
    `;
}

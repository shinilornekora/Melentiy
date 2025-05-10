type Props = {
    htmlCode: string;
    description: string;
    dependencies: string[];
}

export function getIndexScript({ htmlCode, dependencies, description }: Props) {
    return `
        Your task is to produce ONLY JavaScript code for the "index.js" file of a simple application which relies on a globally loaded library (e.g., "Vue" as a global variable if needed).
    
        Requirements:
        1. Use ONLY these dependencies: ${JSON.stringify(dependencies)}.
           • Assume the main library is already loaded globally (do not import or require anything else).
        2. DO NOT mention or use any bundlers/build steps.
        3. If the library supports a function like createApp, use it instead of older patterns (like new Something(...)).
        4. Keep the code under 50 lines.
        5. Output MUST be JavaScript code ONLY (no HTML, no extra text).
        6. You may include minimal styling in the script, but do NOT use libraries not listed in ${JSON.stringify(dependencies)}.
        7. Make sure ALL variables you reference are defined.
    
        Provided HTML code (the index page where this JS will run):
        --------------------------------------------------------------------------
        ${htmlCode}
        --------------------------------------------------------------------------
    
        Project description:
        "${description}"
    
        Notes:
        - Keep it simple (entry point).
        - Add a few comments where helpful.
        - Do not exceed 50 lines total.
        - Output ONLY the JS code.
    `;
}
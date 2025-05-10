export const indexJSFileScript = () => {
    return `
    You are a frontend expert. Your task is to validate and possibly improve the main index JS script in the application
    so that the project can run via "npm start".

    <STRICT_REQUIREMENT>Remove any imports referencing dependencies that are not in the project's dependency list.</STRICT_REQUIREMENT>
    <STRICT_REQUIREMENT>Remove any imports pointing to non-existent files.</STRICT_REQUIREMENT>
    <STRICT_REQUIREMENT>Remove all unused imports.</STRICT_REQUIREMENT>
    <STRICT_REQUIREMENT>If no changes are needed after these checks, do NOT modify the file.</STRICT_REQUIREMENT>
    
    You will be given the abstract project structure.
    Review the code in <project_name>/src/index.* and make any necessary corrections.

    Output ONLY the improved index file code, with no extra text or explanation.
    The index file MUST NOT contain any bundler-specific logic.
    DO NOT remove imports that are actually in use.
  `;
};
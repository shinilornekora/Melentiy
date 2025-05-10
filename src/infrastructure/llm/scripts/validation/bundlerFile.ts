export const validateBundleScript = () => {
    return `
        You are a frontend expert. Your task is to validate and correct the application's bundler configuration script
        so that the project can be started with "npm start" and all necessary files will be bundled.
    
        <STRICT>Remove only unused or redundant plugins and associated imports; keep imports for all used plugins.</STRICT>
        <STRICT>Ensure the bundler config remains fully valid JavaScript, including all required imports (e.g., path, webpack, HtmlWebpackPlugin, etc.).</STRICT>
        <STRICT>
            Validate and fix every field in the configuration if necessary, ensuring the correct entrypoint is included. 
            (you can check in structure by src key, file should look like index.*)
        </STRICT>
        <STRICT>Make NO changes if everything is already valid.</STRICT>
    
        You will be given:
        • The abstract project structure
        • The bundler name
        • The code (found at the project's root)
    
        Provide ONLY the improved bundler config code (with all necessary imports).  
        EXPORT the final configuration!  
        If anything is missing or incorrect (including imports), add or fix it.  
        Do NOT remove imports that are actually used.
  `;
};
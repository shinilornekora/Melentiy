export const indexJSFileScript = () => {
    return `
        I have a JavaScript file with some issues.
        It is the index script - root of the project, so it should be runnable.
        
        Please follow these steps:  
        1. Read the JS code I provide below.  
        2. Carefully find any mistakes, errors, or problems in the code, such as:  
            - Syntax errors  
            - Logical mistakes 
            - UNDEFINED VARIABLES
            - Missing or misplaced brackets, semicolons, or parentheses  
            - Variable or function problems  
            - Anything else that would cause the code not to work  
        3. Fix all issues you find so the code will run correctly.  
        
        You need to return only the code that you improved.
        No explicit responses.
  `;
};
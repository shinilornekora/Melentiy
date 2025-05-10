type Props = {
    description: string;
};

export function getProjectDepsScript({ description }: Props) {
    return `
    Your task is to determine the complete list of NPM dependencies required for a frontend project based on the following description:
    "${description}"

    Important Rules:
    1. Select only relevant dependencies based on the description. Avoid using generic or placeholder examples.
    2. Dependencies must be installable via NPM and written in lowercase (e.g. react, axios, redux).
    3. Use a single, comma-separated string format:
       DEPS: <dep1>, <dep2>, <dep3>, ...
    4. Feel free to add as many additional dependencies as necessary based on the complexity and needs of the project.
    5. Avoid including unnecessary libraries that do not contribute to the project described.
    6. Do not include text or explanation except the formatted dependency string.
    7. Project must have between 3 and 12 initial dependencies (aim for more when relevant).
    8. If you include a framework or library that requires companion packages (e.g., react requires react-dom, vue 3 might require @vue/compiler-sfc, etc.), be sure to include them as well.
    
    Special Notes:
    - If the project requires a specific framework, include it (e.g., react, vue, angular).
    - Include libraries for state management, API handling, utilities, or styling only if applicable.
    - Think critically about tools needed for development, testing, and optimization.

    Project Description:
    "${description}"
  `;
}
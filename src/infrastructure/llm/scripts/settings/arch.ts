type Props = {
    description: string;
}

export function getProjectArchScript({ description }: Props) {
    return `
        I need to define the project architecture.
        The description below outlines the idea for the project.
        Please provide ONLY the architecture type that best fits the project, and you may include a brief explanation of why you selected it.
        Your response should follow this format:
        
        A_TYPE: <NUMBER_OF_A_TYPE> - <Explanation or justification of the choice>

        Choose A_TYPE from the following options:
            - fsd (NUMBER 0) - Feature-Sliced Design
            - microfronts (NUMBER 1) - Microfrontend Architecture
            - module (NUMBER 2) - Module-Based Architecture
            - clean (NUMBER 3) - Clean Architecture
            - ddd (NUMBER 4) - Domain-Driven Design

        **ANSWER FORMAT EXAMPLES**:
        - A_TYPE: 0, FSD fits as the project needs clear separation of features into independent layers.
        - A_TYPE: 1, - Microfronts suits the need for multiple teams to manage separate parts of the UI independently.

        This is the second settings JSON field.
        **NO EXPLICIT TEXT IN RESPONSE. JUST A NUMBER THAT MEANS THE CERTAIN ARCHITECTURE TYPE.**


        IDEA: ${description}
    `;
}

type Props = {
    description: string;
}

export function getProjectNameScript({ description }: Props) {
    return `
        I need to generate a project name based on the description below.
        The project name should be derived from the description and will be used by many people.
        The name must be written in **camelCase** and **in English**.
        Please ensure the name is clear, concise, and reflective of the project's purpose.

        Only the project name should be returned. Do not include any extra text, explanations, or punctuation.

        **ANSWER FORMAT**:
        P_NAME: <generatedProjectNameInCamelCase>

        This is the first settings JSON field.

        IDEA: ${description}
    `;
}

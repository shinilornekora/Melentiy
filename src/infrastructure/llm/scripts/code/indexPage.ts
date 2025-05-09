type Props = {
    description: string;
    dependencies: unknown;
    structure: unknown;
}

export function getIndexPageScript({ description, dependencies, structure }: Props) {
    return `
        Your task is to write HTML code for index page of the js app.
        Dependencies of the project: ${ JSON.stringify(dependencies) }
        Structure of the project: ${ JSON.stringify(structure) }

        **Important Rules**:
        1. You should write index HTML page that will be more suitable for chosen dependencies.
        2. If you have any heavy framework, leave the content part to be filled by them
        3. If you have no any specific framework, you should at least have semantic & good HTML structure
        4. DO NOT GENERATE ANYTHING BUT HTML CODE.
        5. YOU ALWAYS HAVE ACCESS ONLY TO \`styles.css\` STYLES FILE. Do NOT add any other of them in html code.
        5. Try to analyze script tags you lay in HTML. Maybe you don't need them. Think for 5 more seconds about it.
        6. Don't be hasty, take your time.

        **Special Notes**:
        - It is better to leave comments at specific HTML parts (head or main section at least)
        - Don't forget about classNames and ids
        - You should take in mind description of the project. There you extract title for the app.

        **Project Description**:
        "${description}"
    `;
}

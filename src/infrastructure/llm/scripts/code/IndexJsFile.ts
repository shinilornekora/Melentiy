type Props = {
    htmlCode: string;
    description: string;
    dependencies: unknown;
}

export function getIndexScript({ htmlCode, dependencies, description }: Props) {
    return `
        Your task is to write JS code for index file of the js app.
        Dependencies of the project: ${ JSON.stringify(dependencies) }
        HTML code of the index page: 
        
        ${ htmlCode }

        **Important Rules**:
        1. DO NOT WRITE ANYTHING EXCEPT JS CODE
        2. KEEP IT SIMPLE, IT IS ENTRYPOINT (No more than 50 rows, EXCEPTION: NOT COUNTING STYLE TAG.)
        3. TAKE YOUR TIME AND THINK FOR THE BEST CODE - ADD ENOUGH STYLES TO MAKE IT LOOK PRETTY.
        4. DO NOT USE ANY OTHER DEPS THAN ${ JSON.stringify(dependencies) }
        5. STYLE YOUR CODE SO YOU WILL HAVE NON-UGLY components.
        6. DO NOT PUT ANY MARKDOWN.

        **Special Notes**:
        - Put a few comments to make it clear a little

        **Project Description**:
        "${description}"
    `;
}

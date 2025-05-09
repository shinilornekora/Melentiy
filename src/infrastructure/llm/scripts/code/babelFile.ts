type Props = {
    deps: string;
}

export function getTranspilerFileScript({ deps }: Props) {
    return `
        Your task is to write JS code for Babel transpiler file of the js app.
        Other name of this file is .babelrc.
        Deps of the project file: ${ deps }

        **Important Rules**:
        1. You should write this file in JSON language.
        2. DO NOT USE DEPS THAT WASN'T MENTIONED (EXCEPT CRITICAL)
        3. DO NOT WRITE ANYTHING EXCEPT JS CODE.
        4. KEEP IT AS SIMPLE AS YOU CAN. IF PROJECT DOESN'T NEED BABEL ANSWER 'NO'.
        5. Try to NOT use plugins if possible
        6. DO NOT PUT MARKDOWN.
        7. DO NOT PUT COMMENTS.
        
        **STRICT_RULE** 
        
        Do not use old version or old names of versions.
        For example, "react" and "es2015" are deprecated presets.
        They were renamed from Babel 7 to @babel/preset-* syntax.
    `;
}

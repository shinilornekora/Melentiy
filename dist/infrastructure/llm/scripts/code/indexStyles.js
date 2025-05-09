"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndexPageStylesScript = getIndexPageStylesScript;
function getIndexPageStylesScript({ htmlCode, description }) {
    return `
        Your task is to write CSS code for HTML index page of the js app.
        HTML index page code:

        ${htmlCode}

        **Important Rules**:
        1. You should write index HTML page styles that will be more suitable for chosen project theme.
        3. Make it as abstract as possible. Those styles are basic, so you need just a little of them.
        4. DO NOT GENERATE ANYTHING BUT CSS CODE.
        5. Try to analyze what you type. Think for 5 more seconds about it.
        6. Don't be hasty, take your time.

        **Special Notes**:
        - People should not be eager to delete your styles immediately. 
        - Keep them short and nice. Also it would be good to put come comments.

        **Project Description**:
        "${description}"
    `;
}

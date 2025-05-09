"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectSrcScript = getProjectSrcScript;
const generateRequirements = ({ archType, deps }) => `
    <STRICT_REQUIREMENT>
        Output must be valid JSON ONLY. DO NOT INCLUDE COMMENTS OR EXPLANATIONS.
    </STRICT_REQUIREMENT>

    <STRICT_REQUIREMENT>
        Folder structure must fully adhere to "${archType} architecture".
    </STRICT_REQUIREMENT>

    <STRICT_REQUIREMENT>
        Include all relevant folders required for a FRONTEND project with these dependencies:
        ${deps.split(', ').map(dep => `- ${dep}`).join('\n')}
    </STRICT_REQUIREMENT>
`;
const generateHints = (archType) => {
    const hints = {
        fsd: `
            <NOTE> "app" is the root configuration of the application. It contains entry points, providers, and app-wide configuration. </NOTE>
            <NOTE> "processes" manages business logic workflows and cross-cutting concerns such as auth or analytics. </NOTE>
            <NOTE> "pages" contains page-level components, each corresponding to a route. </NOTE>
            <NOTE> "widgets" contains reusable interface-level features like headers, footers, or sidebars. </NOTE>
            <NOTE> "features" contains application-level functionality like forms, modals, etc. </NOTE>
            <NOTE> "entities" represents domain-level abstractions like users, products, etc. </NOTE>
            <NOTE> "shared" contains reusable utilities, components, hooks, and styles shared across the project. </NOTE>
        `,
        module: `
            <NOTE> "src" folder MUST contain the following folders: </NOTE>
            <NOTE> - "modules": Functional modules of the app. Each module has its own folder. </NOTE>
            <NOTE> - "shared": Shared components, hooks, utils, styles, and other reusable elements. </NOTE>
            <NOTE> Each module must include: </NOTE>
            <NOTE> - "components": React components related to the module. </NOTE>
            <NOTE> - "services": API queries or other data logic related to the module. </NOTE>
            <NOTE> - "hooks": Custom React hooks for the module (if applicable). </NOTE>
            <NOTE> - "types": TypeScript types (if applicable). </NOTE>
            <NOTE> - "index.js": Entry point for the module. </NOTE>
            <NOTE> Shared folder must contain reusable components, hooks, utils, and styles. </NOTE>
        `,
        microfronts: `
            <NOTE> The project must have a root "container" application to manage shared resources and orchestrate microfrontends. </NOTE>
            <NOTE> Each microfrontend must be self-contained with its own "components", "hooks", "services", and other relevant folders. </NOTE>
            <NOTE> Shared resources like utilities or styles should exist in a separate "shared" module. </NOTE>
            <NOTE> Each microfrontend must have a "bootstrap.js" file as an entry point for Module Federation. </NOTE>
        `,
        clean: `
            <NOTE> The "app" layer contains framework-dependent configuration, entry points, and high-level composition of the application. </NOTE>
            <NOTE> The "domain" layer contains the core business logic, entities, and use cases. </NOTE>
            <NOTE> The "data" layer handles API calls, repositories, and data access. </NOTE>
            <NOTE> The "presentation" layer includes UI components, hooks, and state management. </NOTE>
            <NOTE> Shared utilities, styles, and common hooks are in a separate "shared" folder accessible by all layers. </NOTE>
        `,
        ddd: `
            <NOTE> Each domain should encapsulate its entities, services, application logic, and UI components. </NOTE>
            <NOTE> The project must include "shared" for common utilities, components, and styles. </NOTE>
            <NOTE> "Application" layer handles use cases and orchestrates domain logic for the UI. </NOTE>
            <NOTE> "Domain" layer contains business logic, entities, and domain services. </NOTE>
            <NOTE> "Infrastructure" handles API calls, data persistence, and external dependencies. </NOTE>
        `
    };
    return hints[archType] || '';
};
function getProjectSrcScript({ archType, deps }) {
    return `
        <GOAL>Generate a folder structure for SRC FOLDER in FRONTEND project implementing "${archType} architecture".</GOAL>
        ${generateRequirements({ archType, deps })}
        <REQUIREMENT> 
        Use keys as folder or file names. If the key represents a folder, 
        the value must be an array. If the key represents a file, the value must be an empty string (""). 
        </REQUIREMENT>
        ${generateHints(archType)}
    `;
}

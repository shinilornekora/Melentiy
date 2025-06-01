import {formStyles} from "./styles/formBlock.js";
import {globalStyles} from "./styles/global.js";
import {langBlockStyles} from "./styles/langBlock.js";
import {historyStyles} from "./styles/history.js";
import {siStyles} from "./styles/si.js";
import {notificationStyles} from "./styles/notification.js";

export const APP_CSS = [
    formStyles,
    globalStyles,
    langBlockStyles,
    historyStyles,
    siStyles,
    notificationStyles,
].reduce((acc, curStyle) => acc + '\n' + curStyle, '');

export function injectAppStyles() {
    if (typeof document === "undefined") {
        return;
    }

    // нет двойному инжекту!
    if (document.getElementById("__injected_app_styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "__injected_app_styles";
    style.textContent = APP_CSS;
    document.head.appendChild(style);
}
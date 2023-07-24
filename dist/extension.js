/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode = __webpack_require__(1);
const fs = __webpack_require__(2);
function getKeysFromJsonFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    return Object.keys(jsonData);
}
async function findUsedLocaleKeys(keys) {
    const usedKeys = new Set();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        for (const folder of workspaceFolders) {
            const folderFiles = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, '**/*.dart'));
            for (const file of folderFiles) {
                const data = fs.readFileSync(file.fsPath, 'utf8');
                const text = data.toString();
                for (const query of keys) {
                    const matches = text.includes(query);
                    console.log('key: =>' + query);
                    console.log('text: =>' + text);
                    if (matches) {
                        usedKeys.add(query);
                    }
                }
            }
        }
    }
    return usedKeys;
}
function removeUnusedLocaleKeys(jsonFilePath, usedKeys) {
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(data);
    for (const key in jsonData) {
        if (!usedKeys.includes(key)) {
            delete jsonData[key];
        }
    }
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
}
function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.removeUnusedLocaleKeys', async () => {
        const jsonFilePath = getCurrentFilePath();
        if (jsonFilePath) {
            const localeKeys = getKeysFromJsonFile(jsonFilePath);
            const usedKeysSet = await findUsedLocaleKeys(localeKeys);
            const usedKeys = Array.from(usedKeysSet);
            removeUnusedLocaleKeys(jsonFilePath, usedKeys);
            vscode.window.showInformationMessage(`Unused locale keys removed from ${jsonFilePath}`);
        }
        else {
            vscode.window.showInformationMessage(`Cannot find json file`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function getCurrentFilePath() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        return activeTextEditor.document.uri.fsPath;
    }
    return undefined;
}

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map
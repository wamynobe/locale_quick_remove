import * as vscode from 'vscode';
import * as fs from 'fs';

function getKeysFromJsonFile(filePath: string): string[] {
	const data = fs.readFileSync(filePath, 'utf8');
	const jsonData = JSON.parse(data);
	return Object.keys(jsonData);
}

async function findUsedLocaleKeys(keys: string[]): Promise<Set<string>> {
	const usedKeys = new Set<string>();

	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (workspaceFolders) {
		for (const folder of workspaceFolders) {
			const folderFiles = await vscode.workspace.findFiles(
				new vscode.RelativePattern(folder, '**/*.dart')
			);

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


function removeUnusedLocaleKeys(jsonFilePath: string, usedKeys: string[]): void {
	const data = fs.readFileSync(jsonFilePath, 'utf8');
	const jsonData = JSON.parse(data);

	for (const key in jsonData) {
		if (!usedKeys.includes(key)) {
			delete jsonData[key];
		}
	}

	fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.removeUnusedLocaleKeys', async () => {
		const jsonFilePath = getCurrentFilePath();
		if (jsonFilePath) {
			const localeKeys = getKeysFromJsonFile(jsonFilePath);
			const usedKeysSet = await findUsedLocaleKeys(localeKeys);

			const usedKeys = Array.from(usedKeysSet);

			removeUnusedLocaleKeys(jsonFilePath, usedKeys);

			vscode.window.showInformationMessage(`Unused locale keys removed from ${jsonFilePath}`);
		} else {
			vscode.window.showInformationMessage(`Cannot find json file`);

		}
	});

	context.subscriptions.push(disposable);
}

function getCurrentFilePath(): string | undefined {
	const activeTextEditor = vscode.window.activeTextEditor;
	if (activeTextEditor) {
		return activeTextEditor.document.uri.fsPath;
	}
	return undefined;
}
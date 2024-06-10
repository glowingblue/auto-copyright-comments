const vscode = require('vscode');
const { execSync } = require('child_process');

const template = `/*
 * This file is part of {package-name}.
 *
 * Copyright (c) Glowing Blue AG.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */`;

const pathsWhitelist = [
	'/src',
	'/tests',
	'/js/src/forum',
	'/js/src/admin',
	'/js/src/common',
	'/migrations',
	'/extend.php',
];

const languagesWhitelist = ['php', 'javascript', 'typescript'];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Add a listener to the onWillSaveTextDocument event of the workspace

	let disposable = vscode.workspace.onWillSaveTextDocument(async (event) => {
		let packageName;

		// First we need to check if the file being saved is a file that belongs to a flarum extension

		// To do that we can check it composer.json file of the workspace and see if it contains a "flarum-extension" property
		// Get the content of composer.json
		const files = await vscode.workspace.findFiles('composer.json');
		if (files.length === 0) {
			return;
		} else {
			// Get package name from composer.json
			const composerJsonPath = files[0].fsPath;
			const composerJsonDoc = await vscode.workspace.openTextDocument(composerJsonPath);
			const composerJsonContent = composerJsonDoc.getText();

			const composerJson = JSON.parse(composerJsonContent);

			if (!composerJson.type || composerJson.type !== 'flarum-extension') {
				return;
			}

			packageName = composerJson.name;
			// Check that the name of the package is like glowingblue/{package-name}
			if (!packageName.startsWith('glowingblue/')) {
				return;
			}
		}

		let pathOk = false;
		const filePath = event.document.fileName;
		// Then we want to check that the file being saved is in a path that represents source code
		// We just need to consider that the file path is an absolute path and not a relative path to the root of the workspace
		// Remove the part of the path that leads to thw workspace
		const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		const relativePath = filePath.replace(workspacePath, '');
		pathsWhitelist.forEach((path) => {
			if (!pathOk && relativePath.startsWith(path)) {
				pathOk = true;
			}
		});

		if (!pathOk) {
			return;
		}

		let languageOk = false;

		// Now we can check that the file is in a language where we want to apply the copyright comment
		languagesWhitelist.forEach((language) => {
			if (!languageOk && event.document.languageId === language) {
				languageOk = true;
			}
		});

		if (!languageOk) {
			return;
		}

		// If the language is PHP, we need to apply an offset to respect the `<?php` tag at the beginning of the file
		const positionOffset = event.document.languageId === 'php' ? 2 : 0;

		// Rough range of the copyright comment (could be smaller, but it should be enough for our purposes)
		const range = new vscode.Range(
			new vscode.Position(0 + positionOffset, 0),
			new vscode.Position(20 + positionOffset, 0),
		);

		// Get the text of the document
		let text = event.document.getText(range);

		// Get the copyright comment from the text.
		// Regex from https://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment
		const copyrightComment = (
			text.match(new RegExp('/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*/')) || ['']
		).pop();

		// Create a new copyright comment from this template
		const newCopyrightComment = template.replace('{package-name}', packageName);

		// Check if the text has changed
		if (copyrightComment && newCopyrightComment !== copyrightComment) {
			vscode.window.activeTextEditor.edit((editBuilder) => {
				// Update the document with the new copyrightComment
				// To do that, find out the range that the original copyrightComment was in
				// And replace it with the new one
				editBuilder.replace(
					new vscode.Range(
						new vscode.Position(0 + positionOffset, 0),
						new vscode.Position(
							// Find the number of new lines in the original copyrightComment
							copyrightComment.split('\n').length + positionOffset,
							// Find the length of the last line
							copyrightComment.split('\n').pop().length,
						),
					),
					`${newCopyrightComment}\n`,
				);
			});
		} else if (!copyrightComment) {
			// If there is no copyright comment, add one
			vscode.window.activeTextEditor.edit((editBuilder) => {
				editBuilder.insert(
					new vscode.Position(0 + positionOffset, 0),
					`${newCopyrightComment}\n\n`,
				);
			});
		}

		// Save the document
		vscode.window.activeTextEditor.document.save();
	});

	context.subscriptions.push(disposable);
}

module.exports = {
	activate,
};

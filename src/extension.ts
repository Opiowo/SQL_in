// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export interface SqlInOptions {
	withQuotes: boolean;
	trimValues: boolean;
	skipEmptyLines: boolean;
	removeDuplicates: boolean;
}

export function buildSqlInClause(text: string, options: SqlInOptions): string {
	let values = text.split(/\r?\n/);

	if (options.skipEmptyLines) {
		values = values.filter(value => value.trim() !== '');
	}

	if (options.trimValues) {
		values = values.map(value => value.trim());
	}

	if (options.removeDuplicates) {
		const seen = new Set<string>();
		values = values.filter(value => {
			if (seen.has(value)) {
				return false;
			}
			seen.add(value);
			return true;
		});
	}

	const formatted = values.map(value => options.withQuotes ? `'${value}'` : value);

	return `in (${formatted.join(',')})`;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	class MyItem implements vscode.QuickPickItem {
		label: string;
		description = '';

		constructor(public detail: string, name: string) {
			this.label = `${name}`;
		}
	};
	let items: { desc: string, name: string }[] = [
		{ 'desc': "Ex. ('abc','def')", "name": "With Quotes" },
		{ 'desc': "Ex. (1,2)", "name": "Without Quotes" }
	];
	const options = items.map((item) => {
		return new MyItem(
			item.desc,
			item.name,
		);
	});

	const sqlin = vscode.commands.registerCommand('sql-in.sqlin', async function () {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const pick = await vscode.window.showQuickPick(options, {
				canPickMany: false
			});
			if (!pick) {
				return;
			}
			const document = editor.document;
			const selection = editor.selection;
			const rows = document.getText(selection);
			if (selection.isEmpty) {
				vscode.window.showErrorMessage('Please make a selection.');
			}
			else {
				const config = vscode.workspace.getConfiguration('sqlIn');
				const newString = buildSqlInClause(rows, {
					withQuotes: pick.label === 'With Quotes',
					trimValues: config.get<boolean>('trimValues', true),
					skipEmptyLines: config.get<boolean>('skipEmptyLines', true),
					removeDuplicates: config.get<boolean>('removeDuplicates', false),
				});
				editor.edit(editBuilder => {
					editBuilder.replace(selection, newString);
				});
			}
		}
		else {
			vscode.window.showErrorMessage('No editor window is open.');
		}
	});

	context.subscriptions.push(sqlin);
}

// This method is called when your extension is deactivated
export function deactivate() { }

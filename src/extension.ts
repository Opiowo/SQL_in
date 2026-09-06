// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export type QuoteStyle = 'none' | 'single' | 'doubleSingle';

export interface LineProcessingOptions {
	trimValues: boolean;
	skipEmptyLines: boolean;
}

export interface SqlInOptions extends LineProcessingOptions {
	quoteStyle: QuoteStyle;
	removeDuplicates: boolean;
}

export interface SqlValuesOptions extends LineProcessingOptions {
	quoteStyle: QuoteStyle;
	removeDuplicates: boolean;
	delimiter: string;
}

function quoteValue(value: string, quoteStyle: QuoteStyle): string {
	switch (quoteStyle) {
		case 'single':
			return `'${value}'`;
		case 'doubleSingle':
			return `''${value}''`;
		default:
			return value;
	}
}

export function resolveDelimiter(raw: string): string {
	return raw.replace(/\\t/g, '\t').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
}

function splitIntoLines(text: string, options: LineProcessingOptions): string[] {
	let lines = text.split(/\r?\n/);

	if (options.skipEmptyLines) {
		lines = lines.filter(line => line.trim() !== '');
	}

	return lines;
}

export function buildSqlInClause(text: string, options: SqlInOptions): string {
	let values = splitIntoLines(text, options);

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

	const formatted = values.map(value => quoteValue(value, options.quoteStyle));

	return `in (${formatted.join(',')})`;
}

export function buildValuesClause(text: string, options: SqlValuesOptions): string {
	const lines = splitIntoLines(text, options);
	let rows = lines.map(line => line.split(options.delimiter));

	if (options.trimValues) {
		rows = rows.map(columns => columns.map(column => column.trim()));
	}

	if (options.removeDuplicates) {
		const seen = new Set<string>();
		rows = rows.filter(columns => {
			const key = JSON.stringify(columns);
			if (seen.has(key)) {
				return false;
			}
			seen.add(key);
			return true;
		});
	}

	const tuples = rows.map(columns => `(${columns.map(column => quoteValue(column, options.quoteStyle)).join(',')})`);

	return `values(\n${tuples.join(',\n')}\n)`;
}

interface QuoteStyleItem extends vscode.QuickPickItem {
	quoteStyle: QuoteStyle;
}

const quoteStyleItems: QuoteStyleItem[] = [
	{ label: 'With Quotes', description: "Ex. ('abc','def')", quoteStyle: 'single' },
	{ label: 'Without Quotes', description: 'Ex. (1,2)', quoteStyle: 'none' },
	{ label: 'Double Single Quotes', description: "Ex. (''abc'',''def'')", quoteStyle: 'doubleSingle' },
];

async function withSelection(callback: (editor: vscode.TextEditor, selectedText: string) => void): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No editor window is open.');
		return;
	}
	const selection = editor.selection;
	if (selection.isEmpty) {
		vscode.window.showErrorMessage('Please make a selection.');
		return;
	}
	callback(editor, editor.document.getText(selection));
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const sqlin = vscode.commands.registerCommand('sql-in.sqlin', async function () {
		const pick = await vscode.window.showQuickPick(quoteStyleItems, { canPickMany: false });
		if (!pick) {
			return;
		}
		await withSelection((editor, selectedText) => {
			const config = vscode.workspace.getConfiguration('sqlIn');
			const newString = buildSqlInClause(selectedText, {
				quoteStyle: pick.quoteStyle,
				trimValues: config.get<boolean>('trimValues', true),
				skipEmptyLines: config.get<boolean>('skipEmptyLines', true),
				removeDuplicates: config.get<boolean>('removeDuplicates', false),
			});
			editor.edit(editBuilder => {
				editBuilder.replace(editor.selection, newString);
			});
		});
	});

	const sqlvalues = vscode.commands.registerCommand('sql-in.values', async function () {
		const pick = await vscode.window.showQuickPick(quoteStyleItems, { canPickMany: false });
		if (!pick) {
			return;
		}
		await withSelection((editor, selectedText) => {
			const config = vscode.workspace.getConfiguration('sqlIn');
			const newString = buildValuesClause(selectedText, {
				quoteStyle: pick.quoteStyle,
				trimValues: config.get<boolean>('trimValues', true),
				skipEmptyLines: config.get<boolean>('skipEmptyLines', true),
				removeDuplicates: config.get<boolean>('removeDuplicates', false),
				delimiter: resolveDelimiter(config.get<string>('valuesDelimiter', '\t')),
			});
			editor.edit(editBuilder => {
				editBuilder.replace(editor.selection, newString);
			});
		});
	});

	context.subscriptions.push(sqlin, sqlvalues);
}

// This method is called when your extension is deactivated
export function deactivate() { }

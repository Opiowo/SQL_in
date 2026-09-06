import * as assert from 'assert';
import { buildSqlInClause, buildValuesClause, resolveDelimiter } from '../../extension';

suite('buildSqlInClause', () => {
	test('quotes values with single quotes', () => {
		const result = buildSqlInClause('abc\ndef', {
			quoteStyle: 'single',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in ('abc','def')");
	});

	test('leaves values unquoted when quoteStyle is none', () => {
		const result = buildSqlInClause('1\n2', {
			quoteStyle: 'none',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, 'in (1,2)');
	});

	test('wraps values in doubled single quotes for OPENQUERY', () => {
		const result = buildSqlInClause('abc\ndef', {
			quoteStyle: 'doubleSingle',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in (''abc'',''def'')");
	});

	test('trims whitespace when trimValues is enabled', () => {
		const result = buildSqlInClause('  abc  \n  def', {
			quoteStyle: 'single',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in ('abc','def')");
	});

	test('keeps whitespace when trimValues is disabled', () => {
		const result = buildSqlInClause('  abc  \ndef', {
			quoteStyle: 'none',
			trimValues: false,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, 'in (  abc  ,def)');
	});

	test('skips empty and whitespace-only lines when skipEmptyLines is enabled', () => {
		const result = buildSqlInClause('abc\n\n   \ndef', {
			quoteStyle: 'single',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in ('abc','def')");
	});

	test('keeps empty lines when skipEmptyLines is disabled', () => {
		const result = buildSqlInClause('abc\n\ndef', {
			quoteStyle: 'none',
			trimValues: true,
			skipEmptyLines: false,
			removeDuplicates: false,
		});
		assert.strictEqual(result, 'in (abc,,def)');
	});

	test('removes duplicates when removeDuplicates is enabled', () => {
		const result = buildSqlInClause('abc\ndef\nabc\ndef\nghi', {
			quoteStyle: 'single',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: true,
		});
		assert.strictEqual(result, "in ('abc','def','ghi')");
	});

	test('deduplicates after trimming so equivalent values collapse', () => {
		const result = buildSqlInClause('abc\n  abc  \ndef', {
			quoteStyle: 'none',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: true,
		});
		assert.strictEqual(result, 'in (abc,def)');
	});

	test('keeps duplicates when removeDuplicates is disabled', () => {
		const result = buildSqlInClause('abc\nabc', {
			quoteStyle: 'single',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in ('abc','abc')");
	});
});

suite('buildValuesClause', () => {
	test('formats a single-column list', () => {
		const result = buildValuesClause('A\nB\nC', {
			quoteStyle: 'single',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
			delimiter: '\t',
		});
		assert.strictEqual(result, "values(\n('A'),\n('B'),\n('C')\n)");
	});

	test('formats a multi-column, delimiter-separated list', () => {
		const result = buildValuesClause('A\t1\nB\t2\nC\t3', {
			quoteStyle: 'single',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
			delimiter: '\t',
		});
		assert.strictEqual(result, "values(\n('A','1'),\n('B','2'),\n('C','3')\n)");
	});

	test('respects a custom delimiter', () => {
		const result = buildValuesClause('A,1\nB,2', {
			quoteStyle: 'none',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
			delimiter: ',',
		});
		assert.strictEqual(result, 'values(\n(A,1),\n(B,2)\n)');
	});

	test('trims each column independently', () => {
		const result = buildValuesClause(' A \t 1 \nB\t2', {
			quoteStyle: 'none',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
			delimiter: '\t',
		});
		assert.strictEqual(result, 'values(\n(A,1),\n(B,2)\n)');
	});

	test('skips empty rows', () => {
		const result = buildValuesClause('A\t1\n\nB\t2', {
			quoteStyle: 'none',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
			delimiter: '\t',
		});
		assert.strictEqual(result, 'values(\n(A,1),\n(B,2)\n)');
	});

	test('removes duplicate rows keeping the first occurrence', () => {
		const result = buildValuesClause('A\t1\nB\t2\nA\t1', {
			quoteStyle: 'none',
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: true,
			delimiter: '\t',
		});
		assert.strictEqual(result, 'values(\n(A,1),\n(B,2)\n)');
	});
});

suite('resolveDelimiter', () => {
	test('converts a literal \\t into a real tab character', () => {
		assert.strictEqual(resolveDelimiter('\\t'), '\t');
	});

	test('leaves an actual tab character unchanged', () => {
		assert.strictEqual(resolveDelimiter('\t'), '\t');
	});

	test('leaves custom delimiters unchanged', () => {
		assert.strictEqual(resolveDelimiter('|'), '|');
		assert.strictEqual(resolveDelimiter(','), ',');
	});
});

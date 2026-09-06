import * as assert from 'assert';
import { buildSqlInClause } from '../../extension';

suite('buildSqlInClause', () => {
	test('quotes values by default settings', () => {
		const result = buildSqlInClause('abc\ndef', {
			withQuotes: true,
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in ('abc','def')");
	});

	test('leaves values unquoted when withQuotes is false', () => {
		const result = buildSqlInClause('1\n2', {
			withQuotes: false,
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, 'in (1,2)');
	});

	test('trims whitespace when trimValues is enabled', () => {
		const result = buildSqlInClause('  abc  \n  def', {
			withQuotes: true,
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in ('abc','def')");
	});

	test('keeps whitespace when trimValues is disabled', () => {
		const result = buildSqlInClause('  abc  \ndef', {
			withQuotes: false,
			trimValues: false,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, 'in (  abc  ,def)');
	});

	test('skips empty and whitespace-only lines when skipEmptyLines is enabled', () => {
		const result = buildSqlInClause('abc\n\n   \ndef', {
			withQuotes: true,
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in ('abc','def')");
	});

	test('keeps empty lines when skipEmptyLines is disabled', () => {
		const result = buildSqlInClause('abc\n\ndef', {
			withQuotes: false,
			trimValues: true,
			skipEmptyLines: false,
			removeDuplicates: false,
		});
		assert.strictEqual(result, 'in (abc,,def)');
	});

	test('removes duplicates when removeDuplicates is enabled', () => {
		const result = buildSqlInClause('abc\ndef\nabc\ndef\nghi', {
			withQuotes: true,
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: true,
		});
		assert.strictEqual(result, "in ('abc','def','ghi')");
	});

	test('deduplicates after trimming so equivalent values collapse', () => {
		const result = buildSqlInClause('abc\n  abc  \ndef', {
			withQuotes: false,
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: true,
		});
		assert.strictEqual(result, 'in (abc,def)');
	});

	test('keeps duplicates when removeDuplicates is disabled', () => {
		const result = buildSqlInClause('abc\nabc', {
			withQuotes: true,
			trimValues: true,
			skipEmptyLines: true,
			removeDuplicates: false,
		});
		assert.strictEqual(result, "in ('abc','abc')");
	});
});

import { ColumnIndex } from '../../src/core/ColumnIndex';

describe('ColumnIndex', () => {
	describe('Number Index', () => {
		let index: ColumnIndex;

		beforeEach(() => {
			index = new ColumnIndex('number');
		});

		it('indexes numbers correctly', () => {
			index.add(25, 0);
			index.add(30, 1);

			expect(index.find(25).has(0)).toBe(true);
			expect(index.find(30).has(1)).toBe(true);
		});

		it('handles greater than queries', () => {
			index.add(25, 0);
			index.add(30, 1);
			index.add(35, 2);

			const result = index.findGreaterThan(28);
			expect(result.has(1)).toBe(true);
			expect(result.has(2)).toBe(true);
			expect(result.has(0)).toBe(false);
		});

		it('handles null values', () => {
			index.add(null, 0);
			expect(index.find(null).size).toBe(0);
		});
	});

	describe('String Index', () => {
		let index: ColumnIndex;

		beforeEach(() => {
			index = new ColumnIndex('string');
		});

		it('indexes strings correctly', () => {
			index.add('abc', 0);
			index.add('def', 1);

			expect(index.find('abc').has(0)).toBe(true);
			expect(index.find('def').has(1)).toBe(true);
		});

		it('rejects greater than on strings', () => {
			expect(() => index.findGreaterThan(10)).toThrow('Cannot perform greater than on non-number column');
		});
	});
});
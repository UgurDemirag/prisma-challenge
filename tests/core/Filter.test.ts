import { FilterFactory, FilterOperator } from '../../src/core/Filter';
import { Schema } from '../../src/core/Schema';
import { NumberTypeInferrer, StringTypeInferrer } from '../../src/core/TypeInference';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import * as path from 'node:path';

describe('Filter', () => {
	let schema: Schema;
	let factory: FilterFactory;

	beforeAll(async () => {
		const samplePath = path.join(__dirname, '..', '..', 'sample.csv');
		const stream = createReadStream(samplePath, { encoding: 'utf-8' });
		const rl = createInterface({ input: stream });

		const rows: string[][] = [];
		let headers: string[] = [];
		let isFirstLine = true;

		for await (const line of rl) {
			if (isFirstLine) {
				headers = line.split(',').map(h => h.trim());
				isFirstLine = false;
				continue;
			}
			rows.push(line.split(',').map(v => v.trim()));
		}

		schema = new Schema(headers, rows.slice(0, 5), [
			new NumberTypeInferrer(),
			new StringTypeInferrer()
		]);
		factory = new FilterFactory(schema);
	});

	describe('Filter Creation', () => {
		it('creates equals filter', () => {
			const filter = factory.createFilter('Age', '=', 25);
			expect(filter.operator).toBe(FilterOperator.EQUALS);
			expect(filter.value).toBe(25);
		});

		it('creates greater than filter', () => {
			const filter = factory.createFilter('Age', '>', 80);
			expect(filter.operator).toBe(FilterOperator.GREATER_THAN);
			expect(filter.value).toBe(80);
		});

		it('rejects invalid operator', () => {
			expect(() => factory.createFilter('Age', '<', 25)).toThrow('Unsupported operator: <');
		});
	});

	describe('Filter Application', () => {
		it('applies equals filter correctly', () => {
			const filter = factory.createFilter('Age', '=', 25);
			expect(filter.apply({ Age: 25, name: 'Pam' })).toBe(true);
			expect(filter.apply({ Age: 30, name: 'Gina' })).toBe(false);
		});

		it('applies greater than filter correctly', () => {
			const filter = factory.createFilter('Age', '>', 85);
			expect(filter.apply({ Age: 90, name: 'Pam' })).toBe(true);
			expect(filter.apply({ Age: 80, name: 'Gina' })).toBe(false);
		});

		it('handles null values', () => {
			const filter = factory.createFilter('Age', '=', 25);
			expect(filter.apply({ Age: null, name: 'Pam' })).toBe(false);
		});
	});
});
import { QueryEngine } from '../../src/core/QueryEngine';
import { QueryErrorCode } from '../../src/errors/QueryEngineError';
import { join } from 'path';

describe('QueryEngine Integration Tests', () => {
	const samplePath = join(__dirname, '..', '..', 'sample.csv');
	let queryEngine: QueryEngine;

	beforeEach(async () => {
		queryEngine = new QueryEngine(samplePath);
		await queryEngine.initialize();
	});

	describe('Data Loading', () => {
		it('successfully loads sample.csv in root folder', async () => {
			const result = queryEngine.executeQuery('PROJECT FirstName,Age');
			expect(result.success).toBe(true);
			expect(result.data!.length).toBeGreaterThan(0);
		});

		it('correctly infers column types', () => {
			const result = queryEngine.executeQuery('PROJECT FirstName,Age');
			expect(result.success).toBe(true);
			expect(typeof result.data![0].Age).toBe('number');
			expect(typeof result.data![0].FirstName).toBe('string');
		});
	});

	describe('Queries', () => {
		it('filters age greater than 30', () => {
			const result = queryEngine.executeQuery('PROJECT FirstName,Age FILTER Age > 30');
			expect(result.success).toBe(true);
			expect(result.data!.every(row => {
				const age = row.Age;
				return age !== null && age > 30;
			})).toBe(true);
		});

		it('handles exact age matches', () => {
			const result = queryEngine.executeQuery('PROJECT FirstName,Age FILTER Age = 32');
			expect(result.success).toBe(true);
			expect(result.data!.every(row => row.Age === 32)).toBe(true);
		});
	});

	describe('Error Cases', () => {
		it('handles invalid column', () => {
			const result = queryEngine.executeQuery('PROJECT nonexistent');
			expect(result.success).toBe(false);
			expect(result.error?.code).toBe(QueryErrorCode.INVALID_COLUMN);
		});

		it('validates type constraints', () => {
			const result = queryEngine.executeQuery('PROJECT FirstName FILTER Age = abc');
			expect(result.success).toBe(false);
			expect(result.error?.code).toBe(QueryErrorCode.TYPE_MISMATCH);
		});

		it('requires PROJECT keyword', () => {
			const result = queryEngine.executeQuery('SELECT FirstName');
			expect(result.success).toBe(false);
			expect(result.error?.code).toBe(QueryErrorCode.INVALID_QUERY);
		});
	});
});
import { Schema } from '../../src/core/Schema';
import { NumberTypeInferrer, StringTypeInferrer } from '../../src/core/TypeInference';
import { QueryErrorCode } from '../../src/errors/QueryEngineError';

describe('Schema', () => {
	const inferrers = [new NumberTypeInferrer(), new StringTypeInferrer()];

	describe('Column Type Inference', () => {
		it('infers number type correctly', () => {
			const headers = ['Age'];
			const data = [['25'], ['30'], ['35']];
			const schema = new Schema(headers, data, inferrers);

			const result = schema.validateColumn('Age');
			expect(result.success).toBe(true);
			expect(result.data).toBe('number');
		});

		it('infers string type for mixed content', () => {
			const headers = ['Index'];
			const data = [['123'], ['abc'], ['456']];
			const schema = new Schema(headers, data, inferrers);

			const result = schema.validateColumn('Index');
			expect(result.success).toBe(true);
			expect(result.data).toBe('string');
		});

		it('handles empty values', () => {
			const headers = ['Age'];
			const data = [[''], ['30'], ['35']];
			const schema = new Schema(headers, data, inferrers);

			const result = schema.validateColumn('Age');
			expect(result.success).toBe(true);
			expect(result.data).toBe('number');
		});
	});

	describe('Value Validation', () => {
		const schema = new Schema(['Age', 'FirstName'], [['25', 'abc']], inferrers);

		it('validates number values', () => {
			const result = schema.validateValue('Age', 30);
			expect(result.success).toBe(true);
			expect(result.data).toBe(30);
		});

		it('rejects string for number column', () => {
			const result = schema.validateValue('Age', 'thirty');
			expect(result.success).toBe(false);
			expect(result.error?.code).toBe(QueryErrorCode.TYPE_MISMATCH);
		});

		it('handles invalid column', () => {
			const result = schema.validateValue('invalid', 'test');
			expect(result.success).toBe(false);
			expect(result.error?.code).toBe(QueryErrorCode.INVALID_COLUMN);
		});
	});
});
import { NumberTypeInferrer, StringTypeInferrer } from '../../src/core/TypeInference';

describe('TypeInference', () => {
	describe('NumberTypeInferrer', () => {
		const inferrer = new NumberTypeInferrer();

		it('identifies valid numbers', () => {
			expect(inferrer.canInfer(['123', '456', '789'])).toBe(true);
		});

		it('handles decimals', () => {
			expect(inferrer.canInfer(['12.34', '56.78'])).toBe(true);
		});

		it('rejects mixed types', () => {
			expect(inferrer.canInfer(['123', 'abc'])).toBe(false);
		});

		it('handles empty values', () => {
			expect(inferrer.canInfer(['123', '', 'null', '456'])).toBe(true);
		});
	});

	describe('StringTypeInferrer', () => {
		const inferrer = new StringTypeInferrer();

		it('always returns true on canInfer', () => {
			expect(inferrer.canInfer()).toBe(true);
		});

		it('always returns string type', () => {
			expect(inferrer.infer()).toBe('string');
		});
	});
});
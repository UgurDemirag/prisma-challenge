import { TypeInferrer } from './TypeInference';
import { ColumnType, ColumnValue, IQueryResult } from '../types';
import { QueryEngineError, QueryErrorCode } from '../errors/QueryEngineError';

export class Schema {
	private readonly columnTypes: ReadonlyMap<string, ColumnType>;

	constructor(
		headers: readonly string[],
		sampleData: readonly string[][],
		private readonly inferrers: readonly TypeInferrer[]
	) {
		this.columnTypes = new Map(
			headers.map((header, index) => [
				header,
				this.inferColumnType(sampleData.map(row => row[index]))
			])
		);
	}

	private inferColumnType(values: readonly string[]): ColumnType {
		for (const inferrer of this.inferrers) {
			if (inferrer.canInfer(values)) return inferrer.infer();
		}
		return 'string';
	}

	validateColumn(columnName: string): IQueryResult<ColumnType> {
		const type = this.columnTypes.get(columnName);
		if (!type) {
			return {
				success: false,
				error:   new QueryEngineError(
					`Column "${columnName}" does not exist`,
					QueryErrorCode.INVALID_COLUMN
				)
			};
		}
		return { success: true, data: type };
	}

	validateValue(columnName: string, value: unknown): IQueryResult<ColumnValue> {
		const typeResult = this.validateColumn(columnName);
		if (!typeResult.success) return typeResult;

		const expectedType = typeResult.data!;
		const actualType = typeof value;

		if (expectedType === 'number' && actualType !== 'number') {
			return {
				success: false,
				error:   new QueryEngineError(
					`Type mismatch: expected number, got ${actualType}`,
					QueryErrorCode.TYPE_MISMATCH
				)
			};
		}

		return { success: true, data: value as ColumnValue };
	}

	getColumnType(columnName: string): ColumnType {
		const result = this.validateColumn(columnName);
		if (!result.success || !result.data) throw result.error;
		return result.data;
	}

	getHeaders(): Set<string> {
		return new Set(Array.from(this.columnTypes.keys()));
	}
}
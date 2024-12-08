import { ColumnValue, DataRow } from '../types';
import { Schema } from './Schema';
import { QueryEngineError, QueryErrorCode } from '../errors/QueryEngineError';

export interface IFilter {
	readonly columnName: string;
	readonly operator: FilterOperator;
	readonly value: ColumnValue;

	apply(row: DataRow): boolean;
}

export enum FilterOperator {
	EQUALS = 'EQUALS',
	GREATER_THAN = 'GREATER_THAN'
}

export class FilterFactory {
	constructor(private readonly schema: Schema) {
	}

	createFilter(columnName: string, operator: string, value: unknown): IFilter {
		const validation = this.schema.validateValue(columnName, value);
		if (!validation.success) {
			throw validation.error;
		}

		return {
			columnName,
			operator: this.parseOperator(operator),
			value:    validation.data!,
			apply:    (row: DataRow) => this.applyFilter(row, columnName, operator, validation.data!)
		};
	}

	private parseOperator(operator: string): FilterOperator {
		switch (operator) {
			case '>':
				return FilterOperator.GREATER_THAN;
			case '=':
				return FilterOperator.EQUALS;
			default:
				throw new QueryEngineError(
					`Unsupported operator: ${operator}`,
					QueryErrorCode.INVALID_QUERY
				);
		}
	}

	private applyFilter(row: DataRow, columnName: string, operator: string, value: ColumnValue): boolean {
		const rowValue = row[columnName];
		if (rowValue === null || value === null) return false;
		return operator === '>' ? rowValue > value : rowValue === value;
	}
}
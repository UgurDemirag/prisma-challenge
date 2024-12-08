import { QueryEngineError } from '../errors/QueryEngineError';

export type ColumnType = 'string' | 'number';
export type ColumnValue = string | number | null;
export type DataRow = Record<string, ColumnValue>;

export interface IQueryResult<T> {
	success: boolean;
	data?: T;
	error?: QueryEngineError;
}

export interface IDataSource {
	readData(): Promise<ReadResult>;
}

export interface ReadResult {
	headers: readonly string[];
	rows: readonly string[][];
}
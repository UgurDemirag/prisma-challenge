import { DataRow, IDataSource, IQueryResult } from '../types';
import { QueryEngineError, QueryErrorCode } from '../errors/QueryEngineError';
import { Schema } from './Schema';
import { FilterFactory, FilterOperator, IFilter } from './Filter';
import { NumberTypeInferrer, StringTypeInferrer, TypeInferrer } from './TypeInference';
import { LRUCache } from './Cache';
import { ColumnIndex } from './ColumnIndex';
import { CsvDataSource } from './CsvDataSource';


export class QueryEngine {
	private data: DataRow[] = [];
	private schema?: Schema;
	private readonly cache: LRUCache<string, DataRow[]>;
	private readonly dataSource: IDataSource;
	private readonly inferrers: TypeInferrer[];
	private readonly indexes: Map<string, ColumnIndex> = new Map();

	constructor(filePath: string) {
		this.cache = new LRUCache<string, DataRow[]>(100);
		this.dataSource = new CsvDataSource(filePath);
		this.inferrers = [new NumberTypeInferrer(), new StringTypeInferrer()];
	}

	async initialize(): Promise<void> {
		try {
			const { headers, rows } = await this.dataSource.readData();
			this.schema = new Schema(headers, rows.slice(0, 5), this.inferrers);
			this.data = this.parseRows(headers, rows);
			this.initializeIndexes();
		} catch (error) {
			throw new QueryEngineError(
				'Failed to initialize query engine',
				QueryErrorCode.INIT_ERROR,
				error instanceof Error ? error : undefined
			);
		}
	}

	private initializeIndexes(): void {
		// console.time('initialize indexes'); -> Would love to get a debug mode
		for (const column of this.schema!.getHeaders()) {
			const columnType = this.schema!.getColumnType(column);
			const index = new ColumnIndex(columnType);

			this.data.forEach((row, rowIndex) => index.add(row[column], rowIndex));

			this.indexes.set(column, index);
		}
		// console.timeEnd('initialize indexes');
	}

	private parseRows(headers: readonly string[], rows: readonly string[][]): DataRow[] {
		return rows.map(row => Object.fromEntries(headers.map((header, i) => [header, this.schema!.getColumnType(header) === 'number' ? Number(row[i]) || null : row[i]])) as DataRow);
	}

	executeQuery(query: string): IQueryResult<DataRow[]> {
		if (!this.schema) {
			return {
				success: false,
				error:   new QueryEngineError(
					'Query engine not initialized',
					QueryErrorCode.INIT_ERROR
				)
			};
		}

		const cached = this.cache.get(query);
		if (cached) return { success: true, data: cached };

		try {
			const { projection, filter } = this.parseQuery(query);
			const result = this.executeQueryInternal(projection, filter);

			if (result.success && result.data) this.cache.set(query, result.data);

			return result;
		} catch (error) {
			return {
				success: false,
				error:   error instanceof QueryEngineError ? error :
					         new QueryEngineError(
						         error instanceof Error ? error.message : 'Unknown error',
						         QueryErrorCode.EXECUTION_ERROR,
						         error instanceof Error ? error : undefined
					         )
			};
		}
	}

	private parseQuery(query: string): { projection: string[], filter?: IFilter } {
		const [projectionPart, filterPart] = query.split('FILTER').map(s => s.trim());

		if (!projectionPart.startsWith('PROJECT')) throw new QueryEngineError('Query must start with PROJECT', QueryErrorCode.INVALID_QUERY);

		const projection = projectionPart.replace('PROJECT', '').trim().split(',').map(s => s.trim());

		// Check if columns really exist
		for (const column of projection) {
			const validation = this.schema!.validateColumn(column);
			if (!validation.success) {
				throw new QueryEngineError(
					`Invalid projection column: ${column}`,
					QueryErrorCode.INVALID_COLUMN
				);
			}
		}

		if (!filterPart) return { projection };

		// Filter space tab etc.
		const [column, operator, valueStr] = filterPart.split(/\s+/);
		if (!column || !operator || !valueStr) throw new QueryEngineError('Invalid filter format', QueryErrorCode.INVALID_QUERY);

		let value: string | number = valueStr;
		// Check if column value is non-numerical value
		if (this.schema!.getColumnType(column) === 'number') {
			const numberValue = Number(valueStr);
			if (isNaN(numberValue)) {
				throw new QueryEngineError(
					`Invalid number value in filter: "${valueStr}"`,
					QueryErrorCode.TYPE_MISMATCH
				);
			}
			value = numberValue;
		}
		const filter = new FilterFactory(this.schema!).createFilter(column, operator, value);

		return { projection, filter };
	}

	private executeQueryInternal(projection: string[], filter?: IFilter): IQueryResult<DataRow[]> {
		try {
			const matchingRows = filter ? (filter.operator === FilterOperator.EQUALS ? this.indexes.get(filter.columnName)!.find(filter.value) : this.indexes.get(filter.columnName)!.findGreaterThan(filter.value as number)) : new Set(Array.from({ length: this.data.length }, (_, i) => i));

			const result = Array.from(matchingRows).map(rowIndex => {
				const row = this.data[rowIndex];
				return Object.fromEntries(projection.map(col => [col, row[col]])) as DataRow;
			});

			return { success: true, data: result };
		} catch (error) {
			return {
				success: false,
				error:   new QueryEngineError(
					error instanceof Error ? error.message : 'Unknown error',
					QueryErrorCode.EXECUTION_ERROR,
					error instanceof Error ? error : undefined
				)
			};
		}
	}
}
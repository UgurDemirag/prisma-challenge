export class QueryEngineError extends Error {
	constructor(
		message: string,
		public readonly code: QueryErrorCode,
		public readonly cause?: Error
	) {
		super(message);
		this.name = 'QueryEngineError';
	}
}

export enum QueryErrorCode {
	INVALID_COLUMN = 'INVALID_COLUMN',
	TYPE_MISMATCH = 'TYPE_MISMATCH',
	INIT_ERROR = 'INIT_ERROR',
	EXECUTION_ERROR = 'EXECUTION_ERROR',
	INVALID_QUERY = 'INVALID_QUERY',
	FILE_NOT_FOUND = 'FILE_NOT_FOUND',
	INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT'
}
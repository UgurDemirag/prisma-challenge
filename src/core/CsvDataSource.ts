import { IDataSource, ReadResult } from '../types';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { QueryEngineError, QueryErrorCode } from '../errors/QueryEngineError';

export class CsvDataSource implements IDataSource {
	constructor(private readonly filePath: string) {
	}

	async readData(): Promise<ReadResult> {
		try {
			const stream = createReadStream(this.filePath, { encoding: 'utf-8' });
			const rl = createInterface({ input: stream });

			const rows: string[][] = [];
			let headers: string[] = [];
			let isFirstLine = true;

			for await (const line of rl) {
				if (isFirstLine) {
					headers = this.parseLine(line);
					isFirstLine = false;
					continue;
				}
				rows.push(this.parseLine(line));
			}

			return { headers, rows };
		} catch (error) {
			throw new QueryEngineError(
				`Failed to read CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
				QueryErrorCode.FILE_NOT_FOUND,
				error instanceof Error ? error : undefined
			);
		}
	}

	private parseLine(line: string): string[] {
		// Handle the commas
		const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
		return matches.map(value => value.startsWith('"') ? value.slice(1, -1).replace(/""/g, '"').trim() : value.trim());
	}
}

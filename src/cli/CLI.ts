import readline from 'readline';
import { existsSync } from 'fs';
import { QueryEngine } from '../core/QueryEngine';

export class QueryCLI {
	private engine?: QueryEngine;
	private readonly rl: readline.Interface;

	constructor() {
		this.rl = readline.createInterface({
			input:  process.stdin,
			output: process.stdout
		});
	}

	async start(): Promise<void> {
		try {
			const filePath = await this.getValidFilePath();
			console.log('Loading data into memory...');

			this.engine = new QueryEngine(filePath);
			await this.engine.initialize();

			console.log('Data loaded. Enter your query (or type "exit" to quit)');

			await this.processQueries();
		} catch (error) {
			console.error('Fatal error:', error instanceof Error ? error.message : 'Unknown error');
		} finally {
			this.rl.close();
		}
	}

	private async getValidFilePath(): Promise<string> {
		while (true) {
			const filePath = await new Promise<string>(resolve => {
				this.rl.question('Enter the full path to your CSV file: ', resolve);
			});

			if (existsSync(filePath) && filePath.toLowerCase().endsWith('.csv')) {
				return filePath;
			}
			console.error('Invalid file path. Please ensure the file exists and is a CSV file.');
		}
	}

	private async processQueries(): Promise<void> {
		while (true) {
			const query = await new Promise<string>(resolve => {
				this.rl.question('\nQuery> ', resolve);
			});

			if (query.toLowerCase() === 'exit') break;

			try {
				const result = this.engine!.executeQuery(query);
				if (result.success && result.data) {
					console.log(`Found ${result.data.length} results:`);
					console.table(result.data);
				} else {
					console.error('Error:', result.error?.message);
				}
			} catch (error) {
				console.error('Query error:', error instanceof Error ? error.message : 'Unknown error');
			}
		}
	}
}
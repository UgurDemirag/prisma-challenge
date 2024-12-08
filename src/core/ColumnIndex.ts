import { ColumnType, ColumnValue } from '../types';

export class ColumnIndex {
	private numberIndex: Map<number, Set<number>> = new Map();
	private stringIndex: Map<string, Set<number>> = new Map();

	constructor(private readonly columnType: ColumnType) {
	}

	add(value: ColumnValue, rowIndex: number): void {
		if (value === null) return;

		if (this.columnType === 'number') {
			const existing = this.numberIndex.get(value as number) ?? new Set<number>();
			existing.add(rowIndex);
			this.numberIndex.set(value as number, existing);
		} else {
			const existing = this.stringIndex.get(value as string) ?? new Set<number>();
			existing.add(rowIndex);
			this.stringIndex.set(value as string, existing);
		}
	}

	find(value: ColumnValue): Set<number> {
		if (value === null) return new Set();

		if (this.columnType === 'number') return this.numberIndex.get(value as number) ?? new Set();

		return this.stringIndex.get(value as string) ?? new Set();
	}

	findGreaterThan(value: number): Set<number> {
		if (this.columnType !== 'number') {
			throw new Error('Cannot perform greater than on non-number column');
		}

		const result = new Set<number>();
		for (const [indexValue, rows] of this.numberIndex.entries()) {
			if (indexValue > value) rows.forEach(row => result.add(row));
		}
		return result;
	}
}
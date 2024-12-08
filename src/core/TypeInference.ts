import { ColumnType } from '../types';

export abstract class TypeInferrer {
	abstract canInfer(values: readonly string[]): boolean;

	abstract infer(): ColumnType;

	protected getNonNullValues(values: readonly string[]): string[] {
		return values.filter(v => v !== null && v !== '' && v !== 'null' && v !== 'undefined');
	}
}

export class NumberTypeInferrer extends TypeInferrer {
	canInfer(values: readonly string[]): boolean {
		const nonNullValues = this.getNonNullValues(values);
		return nonNullValues.length > 0 && nonNullValues.every(value => !isNaN(Number(value)));
	}

	infer(): ColumnType {
		return 'number';
	}
}

export class StringTypeInferrer extends TypeInferrer {
	canInfer(): boolean {
		return true;
	}

	infer(): ColumnType {
		return 'string';
	}
}
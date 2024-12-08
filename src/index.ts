import { QueryCLI } from './cli/CLI';

const cli = new QueryCLI();
cli.start().catch(console.error);
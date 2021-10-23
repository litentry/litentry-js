import definitions from '../src';
import fs from 'fs';

fs.writeFileSync('./types.json', JSON.stringify(definitions, null, 2));

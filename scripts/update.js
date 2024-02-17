/** @format */

import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

console.log('Checking for updates...');

const shell = promisify(exec);

const data = JSON.parse(fs.readFileSync('../config.json'));

if (Number(new Date()) - (data.updatedAt || 0) < 3600000) process.exit();

data.updatedAt = Number(new Date());

fs.writeFileSync('../config.json', JSON.stringify(data), console.error);

// shell('git clone ')

shell('npm i');

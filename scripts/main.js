/** @format */

import * as clack from '@clack/prompts';
import fs from 'fs';
import { inspect, promisify } from 'util';
import { exec } from 'child_process';

const shell = promisify(exec);

async function main() {
	const spinner = clack.spinner();

	spinner.start();
	const data = JSON.parse(fs.readFileSync('../config.json'));

	const keys = data.keys;
	const options = keys.map(({ name, label, host }) => ({ value: `${name}@${host}`, label, hint: `${name}@${host}` }));

	options.push({ value: 'config', label: 'Configuration', hint: 'Add, edit and delete an ssh key.' });
	options.push({ value: 'exit', label: 'Exit', hint: 'Close this window.' });

	let host = await clack.select({
		message: 'Select a host.',
		initialValue: data.lastUsed || 'new',
		options: options,
	});

	if (host == 'config') {
		const config = await clack.select({
			message: 'Configuration',
			initialValue: 'new',
			options: [
				{
					value: 'new',
					label: 'New Key',
					hint: 'Add a new ssh key.',
				},
				{
					value: 'edit',
					label: 'Edit Key',
					hint: 'Edit an ssh key.',
				},
				{
					value: 'delete',
					label: 'Delete Key',
					hint: 'Delete an ssh key.',
				},

				{
					value: 'cancel',
					label: 'Cancel',
					hint: 'Go back to the hosts page.',
				},
			],
		});

		if (config == 'new') {
			const res = await clack.group({
				label: () => clack.text({ message: 'What would you like the label of this key to be?', defaultValue: '' }),
				name: () => clack.text({ message: 'What is the user name?', defaultValue: '' }),
				host: () => clack.text({ message: 'What is the host?', defaultValue: '' }),
				password: () => clack.text({ message: 'What is the password?', defaultValue: '' }),
				port: () => clack.text({ message: 'What is the port?', defaultValue: '' }),
			});
			const proceed = await clack.confirm({ message: `Proceed with following options:\n${inspect(res)}` });

			keys.push(res);

			data.keys = keys;

			if (proceed) {
				fs.writeFileSync('../config.json', JSON.stringify(data), console.error);
			} else {
				spinner.stop();
			}
		}

		if (config == 'edit') {
			// const res = await clack.group({
			// 	label: () => clack.text({ message: 'What would you like the label of this key to be?', defaultValue: '' }),
			// 	name: () => clack.text({ message: 'What is the user name?', defaultValue: '' }),
			// 	host: () => clack.text({ message: 'What is the host?', defaultValue: '' }),
			// 	password: () => clack.text({ message: 'What is the password?', defaultValue: '' }),
			// 	port: () => clack.text({ message: 'What is the port?', defaultValue: '' }),
			// });
			// const proceed = await clack.confirm({ message: `Proceed with following options:\n${inspect(res)}` });
			// keys.push(res);
			// data.keys = keys;
			// if (proceed) {
			// 	fs.writeFileSync('../config.json', JSON.stringify(data), console.error);
			// 	host = `${res.name}@${res.host}`;
			// } else {
			// 	spinner.stop();
			// }
		}

		if (config == 'delete') {
			options.splice(options.length - 2, 2);

			options.push({
				value: 'cancel',
				label: 'Cancel',
				hint: 'Go back to the hosts page.',
			});

			const del = await clack.select({
				message: 'Select a key',
				options: options,
			});

			if (del != 'cancel') {
				const key = keys.find((key) => `${key.name}@${key.host}` == del);

				const index = keys.indexOf(key);

				const proceed = await clack.confirm({ message: `Delete ${key.label}?` });

				if (proceed) {
					keys.splice(index, index + 1);

					data.keys = keys;

					fs.writeFileSync('../config.json', JSON.stringify(data), console.error);

					spinner.stop();
				}
			}
		}
	} else {
		spinner.stop();

		data.lastUsed = host;

		fs.writeFileSync('../config.json', JSON.stringify(data), console.error);
		await shell(`start ssh ${host}`);
	}

	main();
}

main();

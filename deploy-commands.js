const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

// const { clientId, guildId, token } = require('./config.json');
module.exports = (guildId) => {

	const commands = [];
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}

	const rest = new REST({ version: '9' }).setToken(process.env.token);

	rest.put(Routes.applicationGuildCommands(config.id, guildId), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
}
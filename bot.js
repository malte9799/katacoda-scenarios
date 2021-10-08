const fs = require('fs');
const deploy_commands = require("./deploy-commands")
const { Client, Collection, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
let WebSocket;
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Client ready!');


    // WebSocket.app.get('/test', (req, res) => {
    //     this.client.channels.fetch("594075495575060490").then(channel => {
    //         channel.send("My Message");
    //       });
    // })
});

client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
    deploy_commands(guild.id)
    //Your other stuff like adding to guildArray
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.setup = (token, ws) => {
    WebSocket = ws
    client.login(token)
}

exports.client = client
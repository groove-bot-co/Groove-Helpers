module.exports = async (bot) => {
	const channelIDs = Array.from(bot.embedCollection.keys());

	for (const channel of channelIDs) {
		try {
			const webhooks = await bot.channels.fetch(channel).then(c => c.fetchWebhooks());
			let webhook = webhooks.find(wh => wh.name == bot.user.username);

			if (!webhook) {
				webhook = await bot.channels.fetch(channel).then(c => c.createWebhook(bot.user.username, {
					avatar: bot.user.displayAvatarURL({ format: 'png', size: 1024 }),
				}));
			}

			const repeats = Math.ceil(bot.embedCollection.get(channel).length / 10);
			for (let j = 0; j < repeats; j++) {
        const embeds = bot.embedCollection.get(channel)?.slice(j * 10, (j * 10) + 10).map(f => f[0]);
				const files = bot.embedCollection.get(channel)?.slice(j * 10, (j * 10) + 10).map(f => f[1]).filter(e => e != undefined);
				if (!embeds) return;

				await webhook.send({
					embeds: embeds,
					files: files,
				});
			}
			bot.embedCollection.delete(channel);
		} catch (err) {
			bot.logger.error(err.message);
			bot.embedCollection.delete(channel);
		}
	}
};

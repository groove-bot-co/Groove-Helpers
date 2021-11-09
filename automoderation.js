/**
 * Auto moderation
*/
class AutoModeration {
	constructor(bot, message) {
		this.bot = bot;
		this.message = message;
	}

	/**
	 * Function for checking the message with AutoModeration
	 * @returns {void}
	*/
	async check() {
		const { settings: { Auto_Moderation } } = this.message.guild;
		const message = this.message;

		if (Auto_Moderation.IgnoreBot && message.author.bot) return;

		const words = message.content.split(/ +/),
			roles = message.guild.members.cache.get(message.author.id)._roles;

		if (Auto_Moderation.Badwords.option >= 1) {

=			let found;
			if (Auto_Moderation.Badwords.filter == 'ExactMatch') {
				found = words.some(word => Auto_Moderation.Badwords.list.includes(word));

				if (found && this.bot.config.debug) this.bot.logger.debug(`Auto moderation detected: ${words.find(word => Auto_Moderation.Badwords.list.includes(word))} via 'ExactMatch'.`);

			} else if (Auto_Moderation.Badwords.filter == 'Regex') {
				found = words.some(word => {
					for (const badWord of Auto_Moderation.Badwords.list) {
						return (word.indexOf(badWord) !== -1) ? true : false;
					}
				});

				if (found && this.bot.config.debug) {
					this.bot.logger.debug(`Auto moderation detected: ${words.find(word => {
						for (const badWord of Auto_Moderation.Badwords.list) {
							return (word.indexOf(badWord) !== -1) ? true : false;
						}
					})} via 'Regex'.`);
				}

			} else {
				found = words.some(word => {
					for (const badWord of Auto_Moderation.Badwords.list) {
						const distance = require('../utils/functions').CalcLevenDist(word, badWord);
						return (distance <= 2) ? true : false;
					}
				});

				if (found && this.bot.config.debug) {
					this.bot.logger.debug(`Auto moderation detected: ${words.find(word => {
						for (const badWord of Auto_Moderation.Badwords.list) {
							const distance = require('../utils/functions').CalcLevenDist(word, badWord);
							return (distance <= 2) ? true : false;
						}
					})} via 'levDistance'.`);
				}
			}

			if (found) {
				console.log('found');
				if (!Auto_Moderation.Badwords.IgnoreChannel.includes(message.channel.id)) {
					console.log('In a protected channel. punish them');
					if (!Auto_Moderation.Badwords.IgnoreRole.some(role => roles.includes(role))) {
						console.log('Punish user as they dont have ignore role');
						if (Auto_Moderation.Badwords.option == 1) await this.deleteMessage();
						if (Auto_Moderation.Badwords.option == 2) await this.warnMember('Bad word usage.');
						if (Auto_Moderation.Badwords.option == 3) await this.warnDelete('Bad word usage.');
					}
				}
				return true;
			}
		}


		return false;
	}

	/**
	 * Function for deleting offending message
	 * @returns {void}
	*/
	async deleteMessage() {
		if (this.bot.config.debug) this.bot.logger.debug('Deleted message due to auto-moderation.');
		if (this.message.deletable) this.message.delete();
	}

	/**
	 * Function for warning member who sent offending message
	 * @returns {void}
	*/
	async warnMember(reason) {
		if (this.bot.config.debug) this.bot.logger.debug('Warning member due to auto-moderation.');
		try {
			await require('./warning-system').run(this.bot, this.message, this.message.member, reason, this.message.guild.settings);
		} catch (err) {
			this.bot.logger.error(`${err.message} when trying to warn user`);
			this.message.channel.error(this.message.guild.settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.timedDelete({ timeout: 10000 }));
		}
	}

	/**
	 * Function for warning member and deleting message
	 * @returns {void}
	*/
	async warnMemberAndDeleteMessage(reason) {
		if (this.bot.config.debug) this.bot.logger.debug('Warning member and deleting message due to auto-moderation.');
		if (this.message.deletable) this.message.delete();
		await this.warnMember(reason);
	}
}

module.exports = AutoModeration;

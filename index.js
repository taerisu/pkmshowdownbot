const Discord = require('discord.js');
const https = require('https');
const { token, prefix, developerID, botColor } = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
  console.log(`Захожу как: ${client.user.tag}!`);
  client.user.setActivity(`${prefix}help`);
});

client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    const Embed = new Discord.MessageEmbed()
      .setColor(botColor)
      .setTitle('Помощь')
      .setDescription(`Помощь на сервере ${message.guild.name}`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: `${prefix}help`, value: 'Выводит это сообщение', inline: true },
        { name: `${prefix}pokedex или ${prefix}pokemon + (имя) или (id) покемона`, value: 'Узнать информацию о покемоне', inline: true }
      )
      .setFooter(`От ${client.users.cache.find(user => user.id === developerID).username + client.users.cache.find(user => user.id === developerID).discriminator}`, client.users.cache.find(user => user.id === developerID).displayAvatarURL({ dynamic: true }));
    message.channel.send(Embed);
  }  else if (command === 'pokedex' || command === 'pokemon') {  
    https.get('https://play.pokemonshowdown.com/data/pokedex.js?4076b733/', (json) => {
      let body = '';

      json.on('data', (chunk) => {
        body += chunk;
      });

      json.on('end', () => {
        try {
          eval(body)
          response = exports.BattlePokedex[args.join('-').toLowerCase()];

          let type = '';
          let abilities = '';
          let eggGroups = '';

          if (response.types[1] !== undefined) {
            type = response.types[0] + '/' + response.types[1];
          } else {
            type = response.types[0];
          }

          for (i in response.abilities) {
            abilities += `${response.abilities[i]}\n`
          }

          for (i in response.eggGroups) {
            eggGroups += `${response.eggGroups[i]}\n`
          }

          const Embed = new Discord.MessageEmbed()
            .setColor(botColor)
            .setTitle(`Имя: ${response.name}, ID: ${response.num}`)
            .setDescription(`Тип: ${type}`)
            .setThumbnail(`https://play.pokemonshowdown.com/sprites/ani/${args.join('-').toLowerCase()}.gif`)
            .addFields(
              { name: 'Рост', value: response.heightm, inline: true },
              { name: 'Вес', value: response.weightkg, inline: true },
              { name: 'TOTAL', value: response.baseStats.hp + response.baseStats.atk + response.baseStats.def + response.baseStats.spa + response.baseStats.spd + response.baseStats.spe, inline: true },
              { name: 'HP', value: response.baseStats.hp, inline: true },
              { name: 'ATK', value: response.baseStats.atk, inline: true },
              { name: 'DEF', value: response.baseStats.def, inline: true },
              { name: 'SPATK', value: response.baseStats.spa, inline: true  },
              { name: 'SPDEF', value: response.baseStats.spd, inline: true },
              { name: 'SPEED', value: response.baseStats.spe, inline: true },
              { name: 'Abilities', value: abilities, inline: true },
              { name: 'Egg groups', value: eggGroups, inline: true }
          )

          if (response.prevo !== undefined) {
            Embed.addFields(
              { name: 'Prevo', value: response.prevo, inline: true }
            )
          } if (response.evoLevel !== undefined) {
            Embed.addFields(
              { name: 'Evo Level', value: response.evoLevel, inline: true }
            )
          } if (response.evoType !== undefined) {
            Embed.addFields(
              { name: 'Evo type', value: response.evoType, inline: true }
            )
          } if (response.evoCondition !== undefined) {
            Embed.addFields(
              { name: 'Evo condition', value: response.evoCondition, inline: true }
            )
          } if (response.evoItem !== undefined) {
            Embed.addFields(
              { name: 'Evo item', value: response.evoItem, inline: true }
            )
          } if (response.evos !== undefined) {
            let evos = '';

            for (i in response.evos) {
              evos += `${response.evos[i]}\n`;
            }

            Embed.addFields(
              { name: 'Evos', value: evos, inline: true }
            )
          } if (response.otherFormes !== undefined) {
            let otherFormes = '';

            for (i in response.otherFormes) {
              otherFormes += `${response.otherFormes[i]}\n`;
            }

            Embed.addFields(
              { name: 'Other formes', value: otherFormes, inline: true }
            )
          }
          
          Embed.addFields(
            { name: 'Tier', value: response.tier, inline: true }
          )

          message.channel.send(Embed);
        } catch {
          message.channel.send('Ошибка :no_entry_sign:');
        }
      });
    });    
  }
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === welcomeChannel);
  if (!channel) return;

  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext('2d');

  const background = await Canvas.loadImage(backgroundWelcomeImageName);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.font = '35px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Привет,', canvas.width / 2.5, canvas.height / 3.5);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
  ctx.drawImage(avatar, 25, 25, 200, 200);

  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

  channel.send(attachment);
});

client.once('reconnecting', () => {
  console.log(`Перезашёл как: ${client.user.tag}!`);
  client.user.setActivity(`${prefix}help`);
  client.generateInvite(['ADMINISTRATOR']).then(link => {
    inviteUrl = link;
  });
});

client.once('disconnect', () => {
  console.log(`Отключился как ${client.user.tag}!`);
});

client.login(token);
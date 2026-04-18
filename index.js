const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  Events 
} = require('discord.js');

const TOKEN = process.env.TOKEN;

// roles you want (bot will auto-create them with "Oid")
const BASE_ROLES = [
  "Trans",
  "Lesbian",
  "Gay",
  "Genderfluid",
  "SheHer",
  "HeHim",
  "TheyThem"
];

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// ensure role exists (AUTO CREATE)
async function ensureRole(guild, name) {
  let role = guild.roles.cache.find(r => r.name === name);
  if (!role) {
    role = await guild.roles.create({
      name: name,
      reason: "Auto role system"
    });
  }
  return role;
}

// toggle role
async function toggle(member, role) {
  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
  } else {
    await member.roles.add(role);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// BUTTON MENU COMMAND
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // show menu
  if (message.content === "!roles") {
    const buttons = BASE_ROLES.map(r =>
      new ButtonBuilder()
        .setCustomId(r)
        .setLabel(r + "Oid")
        .setStyle(ButtonStyle.Primary)
    );

    const rows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
    }

    await message.channel.send({
      content: "Choose your roles:",
      components: rows
    });
  }

  // text command
  if (message.content.startsWith("!role")) {
    const arg = message.content.split(" ")[1];
    if (!arg) return;

    const match = BASE_ROLES.find(r => r.toLowerCase() === arg.toLowerCase());
    if (!match) return message.reply("Role not found");

    const role = await ensureRole(message.guild, match + "Oid");

    await toggle(message.member, role);
    message.reply("Done");
  }
});

// button click
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const base = interaction.customId;
  const role = await ensureRole(interaction.guild, base + "Oid");

  await toggle(interaction.member, role);

  await interaction.reply({
    content: "Updated role",
    ephemeral: true
  });
});

client.login(TOKEN);
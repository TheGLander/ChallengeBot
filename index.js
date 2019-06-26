//The discord.js module and client
const discord = require("discord.js");
var client = new discord.Client();
//Typo.js setup for word check
const typo = require("typo-js");
const dictionary = new typo("en_US");
//Loading the config file
const config = require("./config.js");
//Loading SQLite module and the database
const SQLite = require("better-sqlite3");
const sql = new SQLite('./database.sqlite');
//Database setup
const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'users';").get();
if (!table['count(*)']) {
    sql.prepare("CREATE TABLE users (id TEXT PRIMARY KEY, user TEXT, guild TEXT, coins INTEGER, badges TEXT, other TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_users_id ON users (id);").run();
    sql.prepare("CREATE TABLE servers (id TEXT PRIMARY KEY, guild TEXT channel TEXT, other TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_servers_id ON servers (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
}
getData = sql.prepare("SELECT * FROM users WHERE user = ? AND guild = ?");
setData = sql.prepare("INSERT OR REPLACE INTO users (id, user, guild, coins, badges, other) VALUES (@id, @user, @guild, @coins, @badges, @other);");
//Importing some useful functions
const useful = require('gsusefulfunctions')
/*      # #                     # #        
       # #     # # # # # # #     # #      
     # # # # # # # # # # # # # # # # #    
     # # # # # # # # # # # # # # # # #    
     # # # # # # # # # # # # # # # # #    
   # # # # # # # # # # # # # # # # # # #  
   # # # # # # # # # # # # # # # # # # #  
   # # # # #     # # # # #     # # # # #  
   # # # #         # # #         # # # #  
 # # # # #         # # #         # # # # #
 # # # # # #     # # # # #     # # # # # #
 # # # # # # # # # # # # # # # # # # # # #
 # # # # # # # # # # # # # # # # # # # # #
 # # # # #     # # # # # # #     # # # # #
     # # # #                   # # # #    
       # # # #               # # # # */

function NewChallenge(guildID) {
    //Wait for 4-6 minutes
    setTimeout(function () {
        const Data = sql.prepare(`SELECT * FROM servers WHERE guild = ?`).get(guildID.toString())
        const channel = client.channels.get(Data.channel);
    }, ( /*240000 + Math.round(120000 * Math.floor())*/ 0))
}
//The commands the bot can execute
const Commands = {
    "info": (msg) => {
        msg.channel.send(`Hello, I am a bot for Discord hack week, made by G lander#3543\n For all commands use ${config.prefix}help`);
    },
    "setup": (msg) => {
        msg.channel.send("What is the channel where the challenges will appear?")
        collector = new discord.MessageCollector(msg.channel, m => !m.author.bot, {
            maxMatches: 1,
            time: 60000
        });

        collector.on('collect', collected => {
            if (client.channels.get(collected.content.replace(/[<>#]/g, "")) === undefined) {
                msg.channel.send('Invalid channel...')
                return;
            }
            var row = {
                "id": msg.guild.id,
                "guild": msg.guild.id,
                "channel": client.channels.get(collected.content.replace(/[<>#]/g, "")).id,
                "other": ""
            }
            sql.prepare("INSERT OR REPLACE INTO servers (id, guild, channel, other) VALUES (@id, @guild, @channel, @other);").run(row)
            msg.channel.send("Setup done!")
        });
        collector.on('end', end => {
            if (end.size == 0) {
                msg.channel.send("No channel sent...")
            }
            return;
        });
    },
    "exec": (msg) => {
        msg.channel.send("Executing...")
        try {
            eval(useful.splitOnce(msg.content, ' ')[1])
        } catch (e) {
            //if (e instanceof SyntaxError) {
            msg.channel.send(new discord.RichEmbed()
                .setColor(0x4286f4)
                .addField("ERROR:", e.message, true));
            //}
        }

    }
}
client.login(config.token);
client.on('ready', () => {
    console.log("I am ready!");
})
client.on("guildCreate", guild => {
    //Seek for first available channel and ask for setup
    var channels = guild.channels.array()
    for (var i = 0; i != channels.length; i++) {
        if (channels[i].type == "text" && channels[i].permissionsFor(guild.me).has(`
                            SEND_MESSAGES `)) {
            channels[i].send(`
                            Hello!I am ChallengeBot, please set me up using $ {
                                config.prefix
                            }
                            setup `);
            break;
        }
    }
})
client.on('message', (msg) => {
    if (msg.author.bot) {
        return;
    };
    if (useful.in_array(msg.content.substr(3).split(" ")[0], Object.keys(Commands)) && msg.content.substr(0, 3) == config.prefix) {
        Commands[msg.content.substr(3).split(" ")[0]](msg)
    }
});
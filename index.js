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
    sql.prepare("CREATE TABLE servers (id TEXT PRIMARY KEY, channel TEXT, other TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_servers_id ON servers (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
}
getData = sql.prepare("SELECT * FROM users WHERE user = ? AND guild = ?");
setData = sql.prepare("INSERT OR REPLACE INTO users (id, user, guild, coins, badges, other) VALUES (@id, @user, @guild, @coins, @badges, @other);");
//Importing some useful functions
const useful = require('gsusefulfunctions')
//List of current challenges
var challengelist = {
    "template": {
        "type": 0,
        "letter": "g",
        "words": [
            "guilty",
            "gorgeous"
        ]
    }
}
/*         
          # # # # # # # # # # # #      
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

function NewChallenge(guildID, type) {
    //Wait for 4-6 minutes
    const timeout = 0//240000 + Math.round(120000 * Math.random())
    setTimeout(function (a) {
        const Data = sql.prepare(`SELECT * FROM servers WHERE id = ?`).get(guildID)
        if (Data === undefined) {
            //
            return;
        }
        switch (type) {
            case 0:
                const channel = client.channels.get(Data.channel);
                const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
                const defwords = ["American", "Born", "Confused", "Desk", "Emigrated", "From", "Gujarat", "House", "In", "Jersey", "Kids", "Learning", "Medicine", "Now", "Owning", "Property", "Quite", "Reasonable", "Salary", "Two", "Ukraine", "Visiting", "White", "Xenophobic", "Yet", "Zestful"]
                const letterID = Math.floor(Math.random() * letters.length)
                const letter = letters[letterID]
                challengelist[guildID] = {
                    "type": 0,
                    "letter": letter,
                    "words": [defwords[letterID].toLowerCase()]
                }
                channel.send(`⭐                                        Challenge!                                        ⭐\nWrite as many words as you can which start with the letter **${letter.toUpperCase()}**!\n                                            Example: ${defwords[letterID]}\n                  For every right word you will gain a coin!\n                                    You have **2 minutes**!`);
                setTimeout(function () {
                    channel.send("Time's up!")
                    delete challengelist[guildID]
                }, config.QuizTimeLimit)
                break;
        }
    }, timeout)
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
                "channel": client.channels.get(collected.content.replace(/[<>#]/g, "")).id,
                "other": ""
            }
            try {
                sql.prepare("INSERT OR REPLACE INTO servers (id, channel, other) VALUES (@id, @channel, @other);").run(row)
            } catch (error) {
                console.log(error)
            }
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
    if (useful.in_array(msg.content.substr(config.prefix.length).split(" ")[0], Object.keys(Commands)) && msg.content.substr(0, config.prefix.length) == config.prefix) {
        Commands[msg.content.substr(config.prefix.length).split(" ")[0]](msg)
    } else if (challengelist[msg.guild.id] !== undefined) {
        var challenge = challengelist[msg.guild.id]
        switch (challenge.type) {
            case 0:
                if (!(msg.content.toLowerCase().startsWith(challenge.letter))) {
                    msg.channel.send(`Word doesn't start with **${challenge.letter.toUpperCase()}**!`)
                    return;
                }
                if (!dictionary.check(msg.content)) {
                    msg.channel.send("Invalid word!")
                    return;
                }
                if (useful.in_array(msg.content.toLowerCase(), challenge.words)) {
                    msg.channel.send("Word already used!")
                    return;
                }
                msg.channel.send(`<@${msg.author.id}> Just submitted a valid word, ${msg.content}!`)
                challengelist[msg.guild.id].words[challengelist[msg.guild.id].words.length] = msg.content.toLowerCase();
                break;
        }
    }
});
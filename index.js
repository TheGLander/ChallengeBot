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
    sql.prepare("CREATE TABLE users (id TEXT PRIMARY KEY, user TEXT, guild TEXT, coins INTEGER, badges TEXT, totalright INTEGER, totalwrong INTEGER, alphabet TEXT, other TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_users_id ON users (id);").run();
    sql.prepare("CREATE TABLE servers (id TEXT PRIMARY KEY, channel TEXT, other TEXT);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_servers_id ON servers (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
}
//Importing some useful functions
const useful = require('gsusefulfunctions');
//Letters
const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
//List of current challenges
var challengelist = {
    "template": {
        "type": 0,
        "letter": "g",
        "letterid": 7,
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
const badges = [{
        "name": "First word!",
        "desc": "Say your first right word!\n(Say your first right word)",
        "condition": "stats.totalright >= 1"
    },
    {
        "name": "First-grader!",
        "desc": "You are now a first grader, yay!\n(Say 3 right words)",
        "condition": "stats.totalright >= 3"
    },
    {
        "name": "I am rich!",
        "desc": "You are rich!\n(Have 5 coins)",
        "condition": "stats.coins >= 5"
    },
    {
        "name": "Typo-man",
        "desc": "Were these typos though?\n(Say 3 invalid words)",
        "condition": "stats.totalwrong >= 3"
    }
]

function SetBadges(stats) {
    var curbadges = stats.badges
    for (var i = 0; i != badges.length; i++) {
        if (eval(badges[i].condition)) {
            curbadges[curbadges.length] = i
        }
    }
    curbadges.sort()
    return curbadges;
}

function NewChallenge(guildID, type) {
    //Wait for 4-6 minutes
    const timeout = 0 //240000 + Math.round(120000 * Math.random())
    setTimeout(function (a) {
        const Data = sql.prepare(`SELECT * FROM servers WHERE id = ?`).get(guildID)
        if (Data === undefined) {
            //No channel setup - no challenges
            return;
        }
        switch (type) {
            case 0:
                const channel = client.channels.get(Data.channel);
                //0 4 8 14 20

                const defwords = ["American", "Born", "Confused", "Desk", "Emigrated", "From", "Gujarat", "House", "In", "Jersey", "Kids", "Learning", "Medicine", "Now", "Owning", "Property", "Quite", "Reasonable", "Salary", "Two", "Ukraine", "Visiting", "White", "Xenophobic", "Yet", "Zestful"]
                const letterID = Math.floor(Math.random() * letters.length)
                const letter = letters[letterID]
                challengelist[guildID] = {
                    "type": 0,
                    "letter": letter,
                    "letterid": letterID,
                    "words": [defwords[letterID].toLowerCase()]
                }
                channel.send(`⭐                                        Challenge!                                        ⭐\nWrite as many words as you can which start with the letter **${letter.toUpperCase()}**!\n                                            Example: ${defwords[letterID]}\n                  For every right word you will gain a coin!\n                                    You have **2 minutes**!`);
                setTimeout(function () {
                    channel.send("Time's up!")
                    delete challengelist[guildID]
                    NewChallenge(guildID, 0)
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
    "help": (msg) => {

        msg.channel.send()
    },
    "stats": async (msg) => {
        var stats = sql.prepare("SELECT * FROM users WHERE user = ? AND guild = ?").get(msg.author.id, msg.guild.id);
        if (!stats) {
            msg.channel.send("You need to participate in a challenge to view your stats!");
            return
        }
        stats.alphabet = JSON.parse(stats.alphabet)
        stats.badges = JSON.parse(stats.badges)
        for (var i = 0; i != stats.alphabet.length; i++) {
            stats.alphabet[i] = letters[stats.alphabet[i]]
        }
        var embed = {
            "title": "Stats",
            "color": 5301186,
            "thumbnail": {
                "url": msg.author.avatarURL
            },
            "author": {
                "name": msg.author.tag,
                "icon_url": msg.author.avatarURL
            },
            "fields": [{
                    "name": "Coins",
                    "value": stats.coins
                },
                {
                    "name": "Right answers(Total)",
                    "value": stats.totalright
                },
                {
                    "name": "Wrong answers(Total)",
                    "value": stats.totalwrong
                },
                {
                    "name": "Answered Letters",
                    "value": JSON.stringify(stats.alphabet).toUpperCase().replace(/["[\]]/g, "")
                }
            ]
        };
        var embed2 = {
            "title": "Badges",
            "color": 5301186,
            "thumbnail": {
                "url": msg.author.avatarURL
            },
            "author": {
                "name": msg.author.tag,
                "icon_url": msg.author.avatarURL
            },
            "fields": [{
                    "name": "Badge 1",
                    "value": "Bla blah blah"
                },
                {
                    "name": "Badge 2",
                    "value": "This is badge 2"
                },
                {
                    "name": "Badge 4",
                    "value": "RIP badge 3"
                }
            ]
        };
        await msg.channel.send({
            embed
        })
        var fields = []
        for(var i = 0;i != stats.badges.length; i++){
            fields[i] = {
                "name": badges[i].name,
                "description": badges[i].desc
            }
        }
        var embed = {
            "title": "Badges",
            "color": 5301186,
            "thumbnail": {
                "url": msg.author.avatarURL
            },
            "author": {
                "name": msg.author.tag,
                "icon_url": msg.author.avatarURL
            },
            "fields": [{
                    "name": "Badge 1",
                    "value": "Bla blah blah"
                },
                {
                    "name": "Badge 2",
                    "value": "This is badge 2"
                },
                {
                    "name": "Badge 4",
                    "value": "RIP badge 3"
                }
            ]
        };
        await msg.channel.send({
            embed
        })
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
            NewChallenge(msg.guild.id, 0)
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
    client.user.setActivity(" with words");
    client.user.setStatus("idle");
    var servers = sql.prepare("SELECT * FROM servers").all()
    for (var o = 0; o != servers.length; o++) {
        NewChallenge(servers[0].id, 0)
    }
})
client.on("guildCreate", guild => {
    //Seek for first available channel and ask for setup
    var channels = guild.channels.array()
    for (var i = 0; i != channels.length; i++) {
        if (channels[i].type == "text" && channels[i].permissionsFor(guild.me).has(`
                            SEND_MESSAGES `)) {
            channels[i].send(`Hello! I am ChallengeBot, please set me up using ${config.prefix}setup!`);
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
                var stats = sql.prepare("SELECT * FROM users WHERE user = ? AND guild = ?").get(msg.author.id, msg.guild.id);
                if (!stats) {
                    var stats = {
                        "id": `${msg.author.id}-${msg.guild.id}`,
                        "user": msg.author.id,
                        "guild": msg.guild.id,
                        "coins": 0,
                        "badges": '[]',
                        "totalright": 0,
                        "totalwrong": 0,
                        "alphabet": "[]",
                        "other": ""
                    }
                }
                stats.badges = JSON.parse(stats.badges);
                stats.alphabet = JSON.parse(stats.alphabet);
                //Check if the word starts with the letter
                if (!(msg.content.toLowerCase().startsWith(challenge.letter))) {
                    msg.channel.send(`Word doesn't start with **${challenge.letter.toUpperCase()}**!`)
                    stats.totalwrong++
                } else
                    //Check if the word exists
                    if (!dictionary.check(msg.content)) {
                        msg.channel.send("Invalid word!")
                        stats.totalwrong++
                    } else
                        //Check if the word is unique 
                        if (useful.in_array(msg.content.toLowerCase(), challenge.words)) {
                            msg.channel.send("Word already used!")
                            stats.totalwrong++
                        } else {
                            stats.coins++
                            stats.totalright++
                            if (!(useful.in_array(challenge.letterid, stats.alphabet))) {
                                stats.alphabet[stats.alphabet.length] = challenge.letterid
                            }
                            msg.channel.send(`<@${msg.author.id}> Just submitted a valid word, ${msg.content}, They get one coin!`)
                            challengelist[msg.guild.id].words[challengelist[msg.guild.id].words.length] = msg.content.toLowerCase();
                        }
                var oldbadges = stats.badges.concat([]);
                stats.badges = SetBadges(stats);
                for (var i = 0; i != stats.badges.length; i++) {
                    if (!useful.in_array(stats.badges[i], oldbadges)) {
                        const embed = {
                            "title": "NEW BADGE",
                            "description": "You got a new badge!",
                            "color": 5301186,
                            "author": {
                                "name": msg.author.tag,
                                "icon_url": msg.author.avatarURL
                            },
                            "fields": [{
                                "name": badges[stats.badges[i]].name,
                                "value": badges[stats.badges[i]].desc
                            }]
                        };
                        msg.channel.send({
                            embed
                        });
                    }
                }
                stats.badges = JSON.stringify(stats.badges);
                stats.alphabet = JSON.stringify(stats.alphabet);
                sql.prepare("INSERT OR REPLACE INTO users (id, user, guild, coins, badges, totalright, totalwrong, alphabet, other) VALUES (@id, @user, @guild, @coins, @badges, @totalright, @totalwrong, @alphabet, @other);").run(stats)
                break;
        }
    }
});
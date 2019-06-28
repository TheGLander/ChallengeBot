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
//All available badges
const badges = [{
        "name": "Purchasable badge A",
        "desc": "Do you feel like a winner?",
        "condition": "true", //When a badge has a cost, conditions acts like a requirement for buying
        "cost": 15 //The cost of a badge(Buyable badges only)
    }, {
        "name": "Purchasable badge A+",
        "desc": "You are the winner+!\n(Must have Purchasable badge A)",
        "condition": "useful.in_array(0, stats.badges)",
        "cost": 30
    }, {
        "name": "Purchasable badge B",
        "desc": "You feel like a champion, right?",
        "condition": "true",
        "cost": 50
    }, {
        "name": "Purchasable badge B+",
        "desc": "You are the super champion+!\n(Must have Purchasable badge B)",
        "condition": "useful.in_array(2, stats.badges)",
        "cost": 100
    }, {
        "name": "Purchasable badge C",
        "desc": "You are a legend, am I right?",
        "condition": "true",
        "cost": 125
    }, {
        "name": "Purchasable badge C+",
        "desc": "You are the ultra-super legend plus!\n(Must have Purchasable badge C)",
        "condition": "useful.in_array(4, stats.badges)",
        "cost": 250
    },
    {
        "name": "Purchasable badge C++",
        "desc": "Oh no! A programming language reference!\n(Must have Purchasable badge C+)",
        "condition": "useful.in_array(5, stats.badges)",
        "cost": 500
    },
    {
        "name": "Cheaters are never winners",
        "desc": "Cheating is bad\n(Buy a badge)",
        "condition": "false" //This badge is a special case, it's obtained after buying a badge, hardcoded in
    },
    {
        "name": "I am rich!",
        "desc": "You are rich!\n(Have 5 coins)",
        "condition": "stats.coins >= 5"
    },
    {
        "name": "I am very rich!",
        "desc": "You are very rich!\n(Have 10 coins)",
        "condition": "stats.coins >= 10"
    },
    {
        "name": "I am super rich!",
        "desc": "You are super rich!\n(Have 25 coins)",
        "condition": "stats.coins >= 25"
    },
    {
        "name": "I am too rich!",
        "desc": "You are too rich!\n(Have 75 coins)",
        "condition": "stats.coins >= 75"
    },
    {
        "name": "I am not rich!",
        "desc": "You are not rich!\n(Have 150 coins)",
        "condition": "stats.coins >= 150"
    },
    {
        "name": "I think you can buy the world...",
        "desc": "The world is expensive BTW\n(Have 300 coins)",
        "condition": "stats.coins >= 300"
    },
    {
        "name": "First word!", //The name of the badge
        "desc": "Say your first right word!\n(Say your first right word)", //It's description
        "condition": "stats.totalright >= 1" //The logical condition for obtaining(Will be eval()'ed)
    }, {
        "name": "First-grader!",
        "desc": "You are now a first grader, yay!\n(Say 3 right words)",
        "condition": "stats.totalright >= 3"
    },
    {
        "name": "Teacher",
        "desc": "Today we will be learning...\n(Say 15 right words)",
        "condition": "stats.totalright >= 15"
    },
    {
        "name": "Academician",
        "desc": "Graduating already, huh?\n(Say 50 right words)",
        "condition": "stats.totalright >= 50"
    },
    {
        "name": "Scholar",
        "desc": "Very good!\n(Say 100 right words)",
        "condition": "stats.totalright >= 100"
    },
    {
        "name": "Professor",
        "desc": "Impossible!\n(Say 250 right words)",
        "condition": "stats.totalright >= 250"
    },
    {
        "name": "Wise Owl",
        "desc": "The wisest of all\n(Say 500 right words)",
        "condition": "stats.totalright >= 500"
    },
    {
        "name": "Vowel master",
        "desc": "A true knower of vowels\n(Say words which starts on each vowels)",
        "condition": "stats.alphabet.includes(0) && stats.alphabet.includes(4) && stats.alphabet.includes(8) && stats.alphabet.includes(14) && stats.alphabet.includes(20)"
    }, {
        "name": "Alphabet god",
        "desc": "Oh wow..\n(Say words which starts on each letter of the alphabet)",
        "condition": "stats.alphabet.length == letters.length",
    },
    {
        "name": "Oops! A typo!",
        "desc": "Everyone makes mistakes\n(Say a wrong word)",
        "condition": "stats.totalwrong >= 1"
    },
    {
        "name": "Typo-man",
        "desc": "Were these typos though?\n(Say 3 wrong words)",
        "condition": "stats.totalwrong >= 3"
    },
    {
        "name": "Egghead",
        "desc": "Are you sure?\n(Say 15 wrong words)",
        "condition": "stats.totalwrong >= 15"
    },
    {
        "name": "Dummy",
        "desc": "Dummy!\n(Say 30 wrong words)",
        "condition": "stats.totalwrong >= 30"
    },
    {
        "name": "Dunce",
        "desc": "Not so clever I see\n(Say 50 wrong words)",
        "condition": "stats.totalwrong >= 50"
    },
    , {
        "name": "Badge 29",
        "desc": "The only unrelated badge\n(Have 28 badges)",
        "condition": "stats.badges.length + 2 == badges.length"
    },
    {
        "name": "THE MASTER BADGE",
        "desc": "The ultimate badge...\n(Have all other badges)",
        "condition": "stats.badges.length + 1 == badges.length",
        "cost": 1000
    }
]

function SetBadges(stats) { //Set the Badges having the stats
    var curbadges = stats.badges
    for (var i = 0; i != badges.length; i++) {
        if (eval(badges[i].condition) && !useful.in_array(i, stats.badges) && badges[i].cost === undefined) { //Check if condition is true, if doesn't have the badge, and if it's not buyable
            curbadges[curbadges.length] = i
        }
    }
    curbadges.sort()
    return curbadges;
}

async function NewChallenge(guildID, type) {
    //Wait for 4-6 minutes
    const timeout = 600000 + 240000 + Math.round(120000 * Math.random())
    setTimeout(async function (a) {
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
                await channel.send(`⭐                                        Challenge!                                        ⭐\nWrite as many words as you can which start with the letter **${letter.toUpperCase()}**!\n                                            Example: ${defwords[letterID]}\n                  For every right word you will gain a coin!\n                                    You have **2 minutes**!`);
                setTimeout(async function () {
                    await channel.send("Time's up!")
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
        const embed = {
            "title": "Help",
            "color": 5301186,
            "author": {
                "name": msg.author.tag,
                "icon_url": msg.author.avatarURL
            },
            "fields": [{
                    "name": "cb!info",
                    "value": "A bit of info."
                },
                {
                    "name": "cb!help",
                    "value": "Shows this message."
                },
                {
                    "name": "cb!top",
                    "value": "The leaderboards, sorted by right words."
                },
                {
                    "name": "cb!top wrong",
                    "value": "The leaderboards, sorted by wrong words."
                },
                {
                    "name": "cb!top coins",
                    "value": "The leaderboards, sorted by coins."
                },
                {
                    "name": "cb!badges <page>",
                    "value": "All the available badges, <page> is the page number(Can be nothing for page 1)."
                },
                {
                    "name": "cb!stats <mention or ID>",
                    "value": "Your(Or the mentioned user's) stats, which include right and wrong words, coins, and badges."
                },
                {
                    "name": "cb!shop <page>",
                    "value": "All the purchasable badges with their item ID's, <page> is the page number(Can be nothing for page 1)."
                },
                {
                    "name": "cb!shop buy [item ID]",
                    "value": "Buys a badge with the provided item ID, Must have enough coins, and the badge's conditions must be met."
                },
                {
                    "name": "cb!setup",
                    "value": "Starts the setup process, to setup, must have Administrator privileges"
                }
            ]
        };
        msg.channel.send({
            embed
        });
    },
    "top": async (msg) => {
        var top10;
        switch (msg.content) {
            case "cb!top wrong":
                top10 = sql.prepare("SELECT * FROM users WHERE guild = ? ORDER BY totalwrong DESC LIMIT 10;").all(msg.guild.id);
                var embed = {
                    "title": "Leaderboard",
                    "color": 5301186,
                    "author": {
                        "name": msg.author.tag,
                        "icon_url": msg.author.avatarURL
                    },
                    "fields": []

                }
                for (var i = 0; i != top10.length; i++) {
                    embed.fields[i] = {
                        "name": (await client.fetchUser(top10[i].user)).tag,
                        "value": top10[i].totalwrong + " wrong words"
                    }
                }

                msg.channel.send({
                    embed
                })
                break;
            case "cb!top coins":
                top10 = sql.prepare("SELECT * FROM users WHERE guild = ? ORDER BY coins DESC LIMIT 10;").all(msg.guild.id);
                var embed = {
                    "title": "Leaderboard",
                    "color": 5301186,
                    "author": {
                        "name": msg.author.tag,
                        "icon_url": msg.author.avatarURL
                    },
                    "fields": []

                }
                for (var i = 0; i != top10.length; i++) {
                    embed.fields[i] = {
                        "name": (await client.fetchUser(top10[i].user)).tag,
                        "value": top10[i].coins + " coins"
                    }
                }

                msg.channel.send({
                    embed
                })
                break;
            default:
                top10 = sql.prepare("SELECT * FROM users WHERE guild = ? ORDER BY totalright DESC LIMIT 10;").all(msg.guild.id);
                var embed = {
                    "title": "Leaderboard",
                    "color": 5301186,
                    "author": {
                        "name": msg.author.tag,
                        "icon_url": msg.author.avatarURL
                    },
                    "fields": []

                }
                for (var i = 0; i != top10.length; i++) {
                    embed.fields[i] = {
                        "name": (await client.fetchUser(top10[i].user)).tag,
                        "value": top10[i].totalright + " valid words"
                    }
                }
                msg.channel.send({
                    embed
                })
                break;
        }
    },
    "badges": async (msg) => {
        const embed = { //The shop embed
            "title": "Shop",
            "color": 5301186,
            "author": {
                "name": msg.author.tag,
                "icon_url": msg.author.avatarURL
            },
            "fields": []
        };
        var fields = []
        //Get all the badges
        for (var i = 0; i != badges.length; i++) {
            fields[fields.length] = {
                "name": `**${badges[i].name}**`,
                "value": badges[i].desc
            }
        }
        var page = parseInt(msg.content.split(" ")[1] === undefined ? 1 : msg.content.split(" ")[1]) //Get the page
        var maxpage = fields.length / 5 > Math.trunc(fields.length / 5) ? Math.trunc(fields.length / 5) + 1 : fields.length / 5 //Get the page maximum
        if (page > maxpage || page < 1 || isNaN(page)) { //Check if the number is valid
            msg.channel.send("Invalid number");
            return;
        }
        var limit = page == maxpage ? fields.length - 5 * (maxpage - 1) : 5 //The limit of pages
        if (fields.length > 5) {
            embed.footer = {
                "text": "If you want to see more badges, append a number, like: cb!badges 2 (Page " + page + "/" + maxpage + ")" //If there are multiple pages
            }
        }
        //Add the needed fields to the embed
        for (var i = 0; i != limit; i++) {
            embed.fields[embed.fields.length] = fields[i + (page - 1) * 5]
        }
        //Send the embed
        await msg.channel.send({
            embed
        })
    },
    "stats": async (msg) => {
        if (msg.content.split(" ")[1] !== undefined) {
            var user = await client.fetchUser(msg.content.split(" ")[1].replace(/[<>@]/g, "")) ? await client.fetchUser(msg.content.split(" ")[1].replace(/[<>@]/g, "")) : msg.author
        } else {
            var user = msg.author
        }
        var stats = sql.prepare("SELECT * FROM users WHERE user = ? AND guild = ?").get(user.id, msg.guild.id);
        if (!stats) {
            var stats = {
                "id": `${user.id}-${msg.guild.id}`,
                "user": user.id,
                "guild": msg.guild.id,
                "coins": 0,
                "badges": '[]',
                "totalright": 0,
                "totalwrong": 0,
                "alphabet": "[]",
                "other": ""
            }
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
                "url": user.avatarURL
            },
            "author": {
                "name": user.tag,
                "icon_url": user.avatarURL
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
                    "value": JSON.stringify(stats.alphabet).toUpperCase().replace(/["[\]]/g, "") === "" ? "None" : JSON.stringify(stats.alphabet).toUpperCase().replace(/["[\]]/g, "")
                }
            ]
        };
        await msg.channel.send({
            embed
        })
        var fields = []
        for (var i = 0; i != stats.badges.length; i++) {
            fields[i] = {
                "name": badges[stats.badges[i]].name,
                "value": badges[stats.badges[i]].desc
            }
        }
        var embed = {
            "title": "Badges",
            "color": 5301186,
            "thumbnail": {
                "url": user.avatarURL
            },
            "author": {
                "name": user.tag,
                "icon_url": user.avatarURL
            },
            "fields": fields
        };
        await msg.channel.send({
            embed
        })
        var fields = []
        if (stats.badges.length > 25) {
            for (var i = 25; i != stats.badges.length; i++) {
                fields[i - 25] = {
                    "name": badges[stats.badges[i]].name,
                    "value": badges[stats.badges[i]].desc
                }
            }
            var embed = {
                "color": 5301186,
                "fields": fields
            };
            await msg.channel.send({
                embed
            })
        }
    },
    "shop": async (msg) => {
        if (msg.content.split(" ")[1] == "buy") { //The buying process
            var fields = [];
            for (var i = 0; i != badges.length; i++) {
                if (badges[i].cost) {
                    fields[fields.length] = i
                }
            }
            var itemID = parseInt(msg.content.split(" ")[2]) - 1;
            if (itemID === undefined) {
                msg.channel.send("To buy you need an item ID!")
                return;
            } else if (itemID > fields.length || itemID < 0 || isNaN(itemID)) {
                msg.channel.send("Invalid item ID!")
                return;
            }
            var item = badges[fields[itemID]]
            var stats = sql.prepare("SELECT * FROM users WHERE user = ? AND guild = ?").get(msg.author.id, msg.guild.id);
            stats.badges = JSON.parse(stats.badges)
            if (stats.badges.includes(fields[itemID])) {
                msg.channel.send("You already have the badge!")
                return;
            }
            if (stats.coins < item.cost) {
                msg.channel.send("Not enough coins!")
                return;
            }
            if (!eval(item.condition)) {
                msg.channel.send("Badge's conditions are not met!")
                return;
            }
            stats.coins -= item.cost
            stats.badges[stats.badges.length] = fields[itemID]
            if (!stats.badges.includes(7)) {
                stats.badges[stats.badges.length] = 7
                const embed = {
                    "title": "NEW BADGE",
                    "description": "You got a new badge!",
                    "color": 5301186,
                    "author": {
                        "name": msg.author.tag,
                        "icon_url": msg.author.avatarURL
                    },
                    "fields": [{
                        "name": badges[16].name,
                        "value": badges[16].desc
                    }]
                };
                msg.channel.send({
                    embed
                });
            }
            stats.badges.sort()
            stats.badges = JSON.stringify(stats.badges)
            const embed = {
                "title": "NEW BADGE",
                "description": "You got a new badge!",
                "color": 5301186,
                "author": {
                    "name": msg.author.tag,
                    "icon_url": msg.author.avatarURL
                },
                "fields": [{
                    "name": item.name,
                    "value": item.desc
                }]
            };
            await msg.channel.send({
                embed
            })
            sql.prepare("INSERT OR REPLACE INTO users (id, user, guild, coins, badges, totalright, totalwrong, alphabet, other) VALUES (@id, @user, @guild, @coins, @badges, @totalright, @totalwrong, @alphabet, @other);").run(stats);
            return;
        }
        const embed = { //The shop embed
            "title": "Shop",
            "color": 5301186,
            "author": {
                "name": msg.author.tag,
                "icon_url": msg.author.avatarURL
            },
            "fields": []
        };
        var fields = []
        //Get all things that can be bought
        for (var i = 0; i != badges.length; i++) {
            if (badges[i].cost) {
                fields[fields.length] = {
                    "name": `${fields.length + 1} - **${badges[i].name} - ${badges[i].cost} coins**`,
                    "value": badges[i].desc
                }
            }
        }
        var page = parseInt(msg.content.split(" ")[1] === undefined ? 1 : msg.content.split(" ")[1]) //Get the page
        var maxpage = fields.length / 5 > Math.trunc(fields.length / 5) ? Math.trunc(fields.length / 5) + 1 : fields.length / 5 //Get the page maximum
        if (page > maxpage || page < 1 || isNaN(page)) { //Check if the number is valid
            msg.channel.send("Invalid number");
            return;
        }
        var limit = page == maxpage ? fields.length - 5 * (maxpage - 1) : 5 //The limit of pages
        if (fields.length > 5) {
            embed.footer = {
                "text": "If you want to see more badges, append a number, like: cb!shop 2 (Page " + page + "/" + maxpage + ")" //If there are multiple pages
            }
        }
        //Add the needed fields to the embed
        for (var i = 0; i != limit; i++) {
            embed.fields[embed.fields.length] = fields[i + (page - 1) * 5]
        }
        //Send the embed
        await msg.channel.send({
            embed
        })
    },
    "setup": (msg) => {
        if (!msg.member.hasPermission(8)) {
            msg.channel.send("You don't have the ADMIN permission!");
            return;
        }
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
}
client.login(config.token);
client.on('ready', () => {
    console.log("I am ready!");
    client.user.setActivity(" with words");
    client.user.setStatus("idle");
    client.user.setAvatar("./Avatar.png")
    var servers = sql.prepare("SELECT * FROM servers").all();
    for (var o = 0; o != servers.length; o++) {
        NewChallenge(servers[o].id, 0);
    }
    for (var o = 0; o != client.guilds.size; o++) {
        var guild = sql.prepare("SELECT * FROM servers WHERE id = ?").get(client.guilds.array()[o].id)
        if (guild === undefined) {
            var newGuild = client.guilds.get(servers[o].id)
            var channels = newGuild.channels.array()
            for (var i = 0; i != channels.length; i++) {
                if (channels[i].type == "text" && channels[i].permissionsFor(newGuild.me).has(1024)) {
                    channels[i].send(`Hello! I am ChallengeBot, please set me up using ${config.prefix}setup`);
                    break;
                }
            }
        }
    }
})
client.on("guildCreate", guild => {
    //Seek for first available channel and ask for setup
    var channels = guild.channels.array();
    for (var i = 0; i != channels.length; i++) {
        if (channels[i].type == "text" && channels[i].permissionsFor(guild.me).has(1024)) {
            channels[i].send(`Hello! I am ChallengeBot, please set me up using ${config.prefix}setup!`);
            break;
        }
    }
})
client.on('message', (msg) => {
    if (msg.author.bot) {
        return;
    };
    if (!msg.guild) {
        return;
    }
    if (useful.in_array(msg.content.substr(config.prefix.length).split(" ")[0], Object.keys(Commands)) && msg.content.substr(0, config.prefix.length) == config.prefix) {
        Commands[msg.content.substr(config.prefix.length).split(" ")[0]](msg);
    } else if (challengelist[msg.guild.id] !== undefined) {
        var challenge = challengelist[msg.guild.id];
        if (msg.channel.id != sql.prepare("SELECT * FROM servers WHERE id = ?").get(msg.guild.id).channel) {
            return;
        }
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
                stats.alphabet.sort()
                stats.badges = JSON.stringify(stats.badges);
                stats.alphabet = JSON.stringify(stats.alphabet);
                sql.prepare("INSERT OR REPLACE INTO users (id, user, guild, coins, badges, totalright, totalwrong, alphabet, other) VALUES (@id, @user, @guild, @coins, @badges, @totalright, @totalwrong, @alphabet, @other);").run(stats)
                break;
        }
    }
});
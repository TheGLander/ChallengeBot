# DiscordHackWeek
Hello, this is a bot I made for Discord hack week!
This bot is named Challenge bot.
It's a bot that makes peeps do challenges once in a while.
# Setup
To host this bot yourself just run this in the directory having node and npm
```
npm install&&npm run-script run
```
# Commands
All the commands can be seen at cb!help
```
cb!info - A bit of info.
cb!help - Shows the help message.
cb!top - The leaderboards, sorted by right words.
cb!top wrong - The leaderboards, sorted by wrong words.
cb!top coins - The leaderboards, sorted by coins.
cb!badges <page> - All the avaliable badges, <page> is the page number(Can be nothing for page 1).
cb!stats <mention or ID> - Your(Or the mentioned user's) stats, which include right and wrong words, coins, and badges.
cb!shop <page> - All the purchasable badges with their item ID's, <page> is the page number(Can be nothing for page 1).
cb!shop buy [item ID] - Buys a badge with the provided item ID, Must have enough coins, and the badge's conditions must be met.
cb!setup - Starts the setup process, to setup, must have Administrator privileges
```

# Description
You know how sometimes while chatting you wish to have a little fun?
Well, Challenge bot solves that! It creates random challenges to keep you on your toes!

In each challenge, the Bot picks a random letter (English) and your goal is to say as many words as you can that starts with that letter.

Each challenge has restricted time.

When you say a valid word(That starts with the letter, Is a real word, and not re-used) the bot will give you a coin!


When the time limit comes You'll need to wait a bit for a new challenge, you know, to cool things down.

# Badges
In this bot, there's a badge system, badges can be obtained by doing specific tasks, like saying a number of valid(or invalid 😉) words.

There are **30** badges in total!

There are also 8 purchasable badges you can buy! 

# Top
There is also a Leaderboard, that will make you fill like the king if you are on the top(Or the Dummy if on the wrong words list)
There are 3 leaderboards:

Valid words leaderboard,
Invalid words leaderboard,
Coins leaderboard

# CMSC 201 Office Hours Bot, Version 1.

This ugly Javascript code is the very first version of a Discord bot used to handle office hours for online learning.

### Here's how it came to be:

On March 11, 2020, to quickly transition to online learning due to UMBC's response to COVID-19, a Discord server was created for students to continue office hours without being in-person.

At the time, Discord was widely known to be able to handle large communities as a free messaging platform for online gamers. Therefore, Discord was initially considered a great idea on very short notice.

The general idea was to have students manually sign up for office hours, then have a Teaching Assistant or Professor contact them through Discord in a private channel to share screens and converse.

I had some experience messing with the Discord API and writing Discord bots in Javascript so I suggested that I had an idea to automate most of the Discord work for office hours.

 ![The moment the bot became an idea](/assets/readme1.png)
 
Given that the next day, March 12, 2020, Thursday, students would be able to use the server right away, the bot would have to be up in less than 24 hours.

The moment I arrived home, I spent about 10 hours straight planning, programming, and testing the bot to be able to handle office hours on Discord without much hassle for students and TAs.

The bot covered the following:
 - Authenticating students before allowing them to access the server (Every student had a generated authentication key which was sent by email, and the list was sent to me and manually copied into the authentication list file `studenthash.json`)
 - Allow students to request office hours, including a message that summarized or provided additional detail with their issue, using a command in a channel designated as the "waiting room". Students were only able to request once at a time.
 - Allow teaching assistants and professors to accept office hour requests in FIFO order. Upon acceptance, the bot automatically assigned a room role to both TA and student, allowing them access to a privated channel.
 - Allow students or TAs to close the office hour room. Upon closure, the room is returned back to an inactive queue, and the room role is removed from all participants.
 
The bot was ready for use on the next day, March 12, 2020.

 ![The moment the bot became reality](/assets/readme2.png)
 
Despite the short amount of time for development, I had a LOT of fun making this bot.

I was glad to have assisted in easing students into remote learning as COVID-19 had abruptly caused classes to be disorganized very quickly.

The bot is now much more organized and is written in Python instead of Javascript, and also is not nastily thrown together (like this first one was). The bot can be found [here](https://github.com/CMSC-201/office-hours-bot), maintained by Benjamin Johnson.
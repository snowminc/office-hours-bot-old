// Dependencies
const Discord = require('discord.js');
// Constants
const fs = require('fs');
const bot = new Discord.Client();
const tokens = require('./tokens.json');
const commcolor = "\x1b[36m%s\x1b[0m";
//const queue = new Map();

// Global student queue initial load
var studentQueue = JSON.parse(fs.readFileSync('./studentQueue.json'));
// Global office room queue initial load
var officeQueue = JSON.parse(fs.readFileSync('./officeRooms.json'));
// Global hash list initial load
var studentHash = JSON.parse(fs.readFileSync('./studenthash.json'));

// Register our event handlers (defined below)
bot.on('message', onMessageHandler);
bot.on('ready', onReadyHandler);
// Handle potential errors to prevent crashing
bot.on('error', console.error);

bot.login(tokens.dtoken);

// Called every time a message is sent
function onMessageHandler(msg) {
  if(msg.author.bot) {return;}

  const text = " " + msg.content + " ";

  var args = [];
  // Start Command Processing
  if (msg.content.startsWith(tokens.prefix)) {
    // Get the user's message excluding the `!`
    const targs = msg.content.substring(1).split(" ");
    for(var i = 0; i < targs.length; i++) {
      if(targs[i] != "") {
        args.push(targs[i]);
      }
    }
    console.log(commcolor, msg.author.username + ` issued command: ${tokens.prefix}${args[0]}`);
  }
  // End Command Processing

  // CMSC 201
  if(msg.guild.id == tokens.cmscServerID) {
    console.log("CMSC Server command!");
    if(args[0] == "close") {
      let closing = null;
      // Find which room was closed
      for(var i = 0; i < officeQueue.occupied.length; ++i) {
        if(officeQueue.occupied[i].room == msg.channel.id) {
          closing = officeQueue.occupied[i];
          officeQueue.occupied.splice(i, 1);
        }
      }
      // If one was found, begin closing the room
      if(closing != null) {
        let officeRoom = msg.guild.channels.cache.get(closing.room);
        let roomRole = msg.guild.roles.cache.get(closing.key);
        // Take the "key" from the teachers and students
        let teacher, student;
        while(closing.teachers.length > 0) {
          teacher = closing.teachers.pop();
          msg.guild.members.cache.get(teacher).roles.remove(roomRole);
        }
        while(closing.students.length > 0) {
          student = closing.students.pop();
          msg.guild.members.cache.get(student).roles.remove(roomRole);
        }
        // Clear all message objects from cache
        let msgCache = officeRoom.messages.cache;
        officeRoom.bulkDelete(msgCache);
        msgCache.clear();
        // Add room back to available
        officeQueue.openRooms.push(closing)
      }
      // Remove message from channel
      msg.delete().catch(console.error);
    }
    // Authentication Room
    if(msg.channel.id == tokens.cmscAuthRoomID) {
      if(args[0] == "auth" && args.length > 1) {
        let name = null;
        let hash = args[1];
        // Find student's hashcode
        console.log(studentHash.unauthed[0]);
        console.log(hash);
        for(var i = 0; i < studentHash.unauthed.length; ++i) {
          if(hash == studentHash.unauthed[i].id) {
            // Set name
            name = studentHash.unauthed[i].name;
            // Move to authed, remove from unauthed
            studentHash.authed.push(studentHash.unauthed[i]);
            studentHash.unauthed.splice(i, 1);
          }
        }
        if(name != null) {
          msg.reply("You have been authenticated! Please go to <#687537904548839426>")
            .then(response => {response.delete({timeout:15000})})
            .catch(console.error);
          let author = msg.author.id;
          let role = msg.guild.roles.cache.get(tokens.cmscStudentRole);
          // name was set earlier

          // Give student Student role
          msg.guild.members.cache.get(author).roles.add(role);
          msg.guild.members.cache.get(author).setNickname(name);
        }
        else {
          msg.reply("You have not given a valid code, or the code has been already used.\n"
            + "Please contact a professor or Min.")
            .then(response => {response.delete({timeout:15000})})
            .catch(console.error);
        }
      }
      else {
        msg.reply("Please provide a your code in this format: `!auth (key)`")
          .then(response => {response.delete({timeout:15000})})
          .catch(console.error);
      }
      // Remove message from channel
      msg.delete().catch(console.error);
    }

    // Request Acception Room
    if(msg.channel.id == tokens.cmscRequestsID) {
      console.log("CMSC Requests Room command!");
      // Accept Requests
      if(args[0] == "accept") {
        if(studentQueue.length < 1) {
          msg.reply("There are currently no students needing help!")
            .then(response => {response.delete({timeout:10000})})
            .catch(console.error);
        }
        else if(officeQueue.openRooms.length < 1) {
          msg.reply("All office hour rooms are currently full!")
            .then(response => {response.delete({timeout:10000})})
            .catch(console.error);
        } 
        else {
          try {
            // Get resources
            var office = officeQueue.openRooms.shift();
            let roomRole = msg.guild.roles.cache.get(office.key);
            officeQueue.occupied.push(office);
            var teacher = msg.author.id;
            var student = studentQueue.shift();
            var tObj = msg.guild.members.cache.get(teacher);
            var sObj = msg.guild.members.cache.get(student.userID);
            // Delete the request
            msg.channel.messages.fetch(student.requestID).then(message => {message.delete()})
            // List occupants
            office.teachers.push(teacher);
            office.students.push(student.userID);
            // Prepare messages
            let message;
            // Give teacher and student the "key" to the room
            tObj.roles.add(roomRole)
              .then(sObj.roles.add(roomRole))
              .then(() => {
                // Alert the student and TA of the existing room
                message = "<@" + teacher + "> and <@" + student.userID + ">";
                msg.guild.channels.cache.get(office.room).send(message);
                message = "Here is your room! You may close this room with `!close`.";
                msg.guild.channels.cache.get(office.room).send(message);
            });
            // Save current state to json
            fs.writeFileSync('./officeRooms.json', JSON.stringify(officeQueue));
            fs.writeFileSync('./studentQueue.json', JSON.stringify(studentQueue));
          } catch(e) {
            console.error(e);
          }
        }
        // Remove message from channel
        msg.delete().catch(console.error);
      }
    }
    // Waiting Room
    else if(msg.channel.id == tokens.cmscWaitingRoomID) {
      console.log("CMSC Waiting Room command!");
      // Make a Help Request
      if(args[0] == "request") {
        var studentID = msg.author.id;
        // Student already pending
        if(valueExists(studentQueue, studentID)) {
          msg.reply("You have already made a request!")
            .then(response => {response.delete({timeout:5000})})
            .catch(console.error);
        }
        // New help request made
        else {
          try {
            // Process information
            let description = msg.content.substring(args[0].length + 1);

            // Send the response to the Students Requests TA Channel
            const embedMsg = new Discord.MessageEmbed()
              .setColor("#0099ff")
              .setAuthor(msg.author.username, msg.author.avatarURL())
              .setDescription(description)
              .addField("Accept request by typing", "!accept")
              .setTimestamp();
            // Send Embedded Message and Push to Queue
            bot.channels.cache.get(tokens.cmscRequestsID).send(embedMsg)
              .then(message => {
                // Generate new queue entry
                queueEntry = {
                  "userID":studentID,
                  "requestID":message.id
                };
                // Add new student to queue
                studentQueue.push(queueEntry);
                // Save current state to json
                fs.writeFileSync('./studentQueue.json', JSON.stringify(studentQueue));
              })
              .catch(console.error);
            // End Embedded Message

            // Respond, then delete response.
            msg.reply("Your request will be processed!")
              .then(response => {response.delete({timeout:5000})})
              .catch(console.error);
          } catch(e) {
            console.error(e);
          }
        }
      }
      // Not a request
      else {
        console.log("Not a request...");
      }
      // Remove message from channel
      msg.delete().catch(console.error);
    } // End Waiting Room




  } // End CMSC 201

function valueExists(queue, id) {
  for(var i = 0; i < queue.length; ++i) {
    var item = queue[i];
    if(item.userID == id) {
      return true;
    }
  }
  return false;
}

// Called every time the bot connects to Discord
function onReadyHandler() {
  console.log("\x1b[42m\x1b[30m%s\x1b[0m", `* Connected to Discord!`);
}

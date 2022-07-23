// Import Firebase
var admin = require("firebase-admin");
var serviceAccount = require("./kachow_adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://kachow-67bdb-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const {
  getFirestore,
  collection,
  doc,
  get,
  collectionGroup,
  where,
} = require("firebase-admin/firestore");
const db = getFirestore();

// Import Telegraf and dotenv
const { Telegraf, Markup } = require("telegraf");
const { app } = require("firebase-admin");
require("dotenv").config();

// Import node-schedule
const schedule = require("node-schedule"); // shift upwards

// Error handling for no Bot Token in environment
if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided!");
}

// Initialize bot and Firebase
const bot = new Telegraf(process.env.BOT_TOKEN);

// Helper function to check if user has started chat with telebot before
async function pastUser(ctx) {
  const userRef = await db
    .collection("chats")
    .doc(ctx.message.chat.id.toString())
    .get();
  return userRef.exists;
}

// Schedule Messages every day at midnight
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.tz = "Singapore";
const job = schedule.scheduleJob(rule, scheduler);
const f = new Intl.DateTimeFormat("en-ZA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
});

// TODO: Query by existing chats with Kachow first, check if reminders are on, then check through all bookings
async function scheduler() {
  console.log("Message scheduling starts!");

  // Get all booking information
  const querySnapshot = await db.collectionGroup("records").get();

  querySnapshot.forEach((booking) => {
    var tmp = booking.data();
    var today = f.format(new Date());

    // check if date of booking coincides with current day
    if (tmp.datetime.split(", ")[0] == today.split(", ")[0]) {
      checkReminderAndSend(tmp);
    }
  });
}

async function checkReminderAndSend(tmp) {
  // Find the chatId corresponding to the booking
  console.log("Checking if reminders is enabled");
  const chatQuerySnapshot = await db
    .collection("chats")
    .where("userId", "==", tmp.user)
    .get();
  chatQuerySnapshot.forEach((chat) => {
    let chatData = chat.data();
    // If user has enabled reminders, send the message to said user.
    if (chatData.reminders) {
      bot.telegram.sendMessage(
        chat.id,
        "Reminder: You have a booking today for " +
          tmp.bookingDesc +
          " at " +
          tmp.datetime
      );
    }
  });
}

// Start function handler
async function handleStart(ctx) {
  // Check if previous user
  if (await pastUser(ctx)) {
    console.log("User exists in system");
    ctx.reply("Welcome back!");

    // Check if user starts conversation from BBDC Portal
  } else if (ctx.message.text.split(" ").length > 1) {
    console.log("New user directed from website");
    const userId = ctx.message.text.split(" ")[1].toString();
    console.log(userId, typeof userId);
    const studentRef = await db.collection("accounts").doc(userId).get();

    // valid user, register in database
    if (studentRef.exists) {
      console.log("Valid user!");
      const res = await db
        .collection("chats")
        .doc(ctx.message.chat.id.toString())
        .set({
          userId: userId,
          telegramUser: ctx.message.from.username,
          reminders: false,
        });
      ctx.reply("Welcome to BBDC Telebot!");

      // invalid user, throw error
    } else {
      console.log("Invalid user!");
      ctx.reply("You are not a registered user.");
    }

    // Invalid user/did not come from BBDC website
  } else {
    console.log("Invalid Login");
    ctx.reply("Please login from BBDC student portal > My Account page!");
  }
}

// Bookings function handler
async function handleBookings(ctx) {
  if (await pastUser(ctx)) {
    console.log("Retrieving bookings");
    var userId = await db
      .collection("chats")
      .doc(ctx.message.chat.id.toString())
      .get();
    userId = userId.data().userId;

    // retrieve bookings of registered student
    const bookingRes = await db
      .collectionGroup("records")
      .where("user", "==", userId)
      .orderBy("datetime")
      .get();

    var reply = "Your upcoming bookings are as follows:\n";
    bookingRes.forEach((record) => {
      record = record.data();
      if (Date.parse(record.datetime) > Date.now()) {
        reply += record.datetime + " - " + record.bookingDesc + "\n";
      }
    });

    ctx.reply(reply);
  } else {
    console.log("Unregistered user");
    ctx.reply("You are not a registered user.");
  }
}

// ToggleReminder Handler
async function reminders(ctx) {
  if (await pastUser(ctx)) {
    console.log("Checking reminder status");
    // check if reminders are enabled for user
    var isReminder = await db
      .collection("chats")
      .doc(ctx.message.chat.id.toString())
      .get();
    isReminder = isReminder.data().reminders;
    console.log(isReminder, typeof isReminder);

    if (isReminder) {
      ctx.reply(
        "Reminders are on. Would you like to turn them off?",
        Markup.inlineKeyboard([
          Markup.button.callback("Turn off reminders", "disableReminders"),
          Markup.button.callback("Cancel", "cancel"),
        ])
      );
    } else {
      ctx.reply(
        "Reminders are off. Would you like to turn them on?",
        Markup.inlineKeyboard([
          Markup.button.callback("Turn on reminders", "enableReminders"),
          Markup.button.callback("Cancel", "cancel"),
        ])
      );
    }
  } else {
    console.log("Unregistered user");
    ctx.reply("You are not a registered user.");
  }
}

async function enableReminder(ctx) {
  console.log("Enabling reminders.");
  const docRef = await db.collection("chats").doc(ctx.from.id.toString());
  const res = await docRef.update({ reminders: true });
  ctx.editMessageText(
    "Reminders have been enabled. Reminders will be sent out at 12am on the day of your booking!"
  );
}

async function disableReminder(ctx) {
  console.log("Disabling reminders.");
  const docRef = await db.collection("chats").doc(ctx.from.id.toString());
  const res = await docRef.update({ reminders: false });
  ctx.editMessageText("Reminders have been disabled.");
}

// Help message
const helpMessage = `Welcome to BBDC Reminder Bot! With this bot, you can:
1. Retrieve your upcoming lesson/test bookings with /bookings
2. Toggle whether the bot will send you lesson/test slot reminders with /reminders. Reminders will be sent out at 12am daily if you have any bookings on the day itself.
`;

// Bot handlers
bot.start((ctx) => handleStart(ctx));
bot.help((ctx) => ctx.reply(helpMessage));
bot.command("bookings", (ctx) => handleBookings(ctx));
bot.command("reminders", (ctx) => reminders(ctx));

bot.action("enableReminders", (ctx) => enableReminder(ctx));
bot.action("disableReminders", (ctx) => disableReminder(ctx));
bot.action("cancel", (ctx) => {
  ctx.editMessageText("Alright, cancelling operation.");
});

bot.on("message", (ctx) =>
  ctx.telegram.sendCopy(ctx.message.chat.id, ctx.message)
);

// Bot launch & Enable graceful stop
bot.launch();
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  schedule.gracefulShutdown().then(() => process.exit(0));
});
process.once("SIGTERM", () => bot.stop("SIGTERM"));

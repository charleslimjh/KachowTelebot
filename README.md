# KachowTelebot

The Telegram bot allows users to retrieve their upcoming bookings and enable automated reminders to be sent to students at 12:30 a.m. on the day of their bookings.

The Telegram bot is currently hosted on `Heroku`, and can only be accessed by users of the Kachow! Student Portal. Trying to start a conversation by manually searching for the bot in Telegram will result in an error message. This is to authenticate students of the Kachow! Student Portal.

## Starting the bot
1. Login to the Kachow! BBDC Student Portal [here](https://kachowbbdc.netlify.app).
2. Navigate to the `My Account` page in the navigation bar.
3. Click on the "Link to Telegram" button in the My Account page.
4. When prompted, login to Telegram and send the `/start` command. The bot will recognize if you are a user directed from the BBDC portal.

**Note: This is a one-time setup: The bot will recognize if you have previously started the bot in this way.**

After the initial setup, if you clear chat history/delete the bot, you may either:
- Start the conversation from the student portal, or 
- Search for the bot on Telegram at `@kachow_testbot`.

## Local Deployment
To deploy the application locally:
1. Run `npm install` to install necessary dependencies for the project.
2. Generate the `.env` file which contains the Telegram Bot's API key and Firebase's Admin SDK Service Account.
3. Run `node app.js` to launch the app.

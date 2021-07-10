# This is a final version of the Express server side for React Auth tutorial

This project is ment to run in tandem with [React client side auth tutorial](https://github.com/dataod/react-auth-tutorial-final).

## Prerequisites

- Node.js and MongoDB installed on your system

To use additional features you'll also need Google developer account with configured Oath credentials and ReCAPTCHA.
To send emails this tutorial uses Mailgun as an ESP, so you'll need credentials for it on server side.

## To make server run properly you'll need to fill in the ENV variables in .env file for 3rd party services like mailgun, google Oauth and reCAPTCHA

Also create "feedbacks" and "orders" mongoDB collections and upload mock jsno files provided in data folder.

### `npm install`

### `npm start`

In development:

### `npm run dev`

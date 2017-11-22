
'use strict';
require('es6-promise').polyfill();
require('isomorphic-fetch');

const
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request'),
  generateLink = require('./data.js'),
  arrOfQuest = require('./questObj.js');

var idQuest = 0;
var lang;
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

const NODE_ENV = (process.env.NODE_ENV) ?
  process.env.NODE_ENV :
  config.get('nodeEnv');

const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

app.get('/privacy_policy.html',function(req,res){

     res.sendFile(__dirname + '/privacy_policy.html');
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    res.sendStatus(200);
  }
});


app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  var authCode = "1234567890";

  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});


function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {

    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam,
    timeOfAuth);

  sendTextMessage(senderID, "Authentication successful");
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s",
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
      if (quickReplyPayload.match(/false/)) {
        var topic = quickReplyPayload.split(' ').slice(1).join(' ');
        quickReplyPayload = quickReplyPayload.split(' ')[0]
      }
      switch (quickReplyPayload.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
        case 'hello':
        case 'hi':
        case 'get started':
          sendHiMessage(senderID);
          break;

        case 'javascript quiz':
              idQuest = 0;
              quest(senderID, idQuest);
          break;

        case 'python quiz':
              idQuest = 0;
              sendTextMessage(senderID, "To be honest, I only know Javascript 😅, so let's train that!")
              quest(senderID, idQuest);
              break;

        case 'true':
              if (idQuest < arrOfQuest.length - 1) {
                idQuest++;
                sendTextMessage(senderID, 'Good job! 💪  Next question!');
                quest(senderID, idQuest);
              } else {
                idQuest = 0;
                sendTextMessage(senderID, 'Well done, you\'ve solved all our excercises!');
              }
          break;

        case 'false':
              idQuest++;
              wrongQuest(senderID, topic);
              sendTextMessage(senderID, 'Wrong answer😱');
          break;

        case 'javascript':
        case 'python':
        case 'ruby':
        case 'csharp':
          lang = quickReplyPayload;
          sendDifficulty(senderID);
          break;

        case 'easy':
        case 'mid':
        case 'hard':
          var diff = quickReplyPayload;
          var linky = generateLink(diff, lang);
          sendChallangeLink(senderID, linky);
          break;

      }
    return;
  }

  if (messageText) {
    switch (messageText.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
      case 'hello':
      case 'hi':
      case 'get started':
        sendHiMessage(senderID);
        break;

      case 'test':
        startTest(senderID);
        break;

      case 'gif':
        sendTypingOn(senderID);
        sendGifMessage(senderID);
        sendTypingOff(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'typing on':
        sendTypingOn(senderID);
        break;

      case 'typing off':
        sendTypingOff(senderID);
        break;

      case 'account linking':
        requiresServerURL(sendAccountLinking, [senderID]);
        break;

      case 'help':
        sendHelpMenu(senderID);
        break;

      case 'train':
        sendLanguage(senderID);
        break;

      case 'exit':
        sendTextMessage(senderID, 'Ok, see you whenever you want to be tested again 👋 ');
        break;

      case 'which language do you speak?':
        sendTextMessage(senderID, 'For now I\'m speaking only JS, but I\'m studying other languages');
        break;

      default:
        var rdmResp = ['Sorry, I didn\'t get that', 'I\'m not quite sure what you mean', 'Sorry?', 'Yeah I almost totally agree with you', 'I can\'t answer that, but I\'ll be your friend!'];
        messageText = rdmResp[Math.floor(Math.random() * rdmResp.length)];
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

    switch (payload.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
      case 'hello':
      case 'hi':
      case 'get started':
        sendHiMessage(senderID);
        break;

      case 'continue':
            quest(senderID, idQuest);
        break;

    }

  // sendTextMessage(senderID, "Postback called");
}

function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}


function sendHiMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: `
Hi, I'm here to make you the best developer in the world.

We can "train" toghether, I can "test" your knowledge or just send you a "gif".

If you need any "help", just ask.
Have fun! 🤙
      `
    }
  }

  callSendAPI(messageData);
}

function sendHelpMenu(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: `
I'm still very young, so I only understand these commands:
test  - I'll ask you questions about coding
train - I'll select a CodeWars challenge for you
exit  - Drops you out of whatever you're doing
gif   - I'll send you a hilarous gif about programming
      `
    }
  }
  callSendAPI(messageData);
}


function sendGifMessage(recipientId) {
  let gifJSON
  let url = 'http://api.giphy.com/v1/gifs/random?api_key=zvn353Fk25gQ9V6vE0UGVcN4DIyOXk4z&tag=programming';
  fetch(url, { method: 'GET' })
    .then(function(response) {
    response.text().then(function(text) {
        gifJSON = JSON.parse(text);
        var messageData = {
          recipient: {
            id: recipientId
          },
          message: {
            attachment: {
              type: "image",
              payload: {
                url: gifJSON.data.image_original_url
              }
            }
          }
        };
        callSendAPI(messageData);
    });
  })
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}


function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Trigger Postback",
            payload: "DEVELOPER_DEFINED_PAYLOAD"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  };
  callSendAPI(messageData);
}



function wrongQuest(recipientId, topic) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: topic.split('/').slice(-1)[0],
            subtitle: `Take a look at this topic, it's better to revise it`,
            item_url: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/${topic}`,
            image_url: 'http://www.maboa.co/img/portfolio/mdn.png',
            buttons: [{
              type: "web_url",
              url: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/${topic}`,
              title: "Open MDN"
            }, {
              type: "postback",
              title: "Continue",
              payload: "continue"
            }],
          }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function sendChallangeLink(recipientId, linky) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: 'Codewars challenge',
            subtitle: `Open the link I've just sent you, a new challenge is wating for you`,
            item_url: `${linky}`,
            image_url:  'https://d2gn4xht817m0g.cloudfront.net/p/product_screenshots/images/preview505/000/155/390/155390-0e6082933ef0647e22246e2791de61a46afb1ec1.jpg?1364103310',
            buttons: [{
              type: "web_url",
              url: `${linky}`,
              title: "Begin your Challange @Codewars"
            }],
          }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function sendDifficulty(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Choose the difficulty",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Easy",
          "payload":"easy"
        },
        {
          "content_type":"text",
          "title":"Medium",
          "payload":"mid"
        },
        {
          "content_type":"text",
          "title":"Hard",
          "payload":"hard"
        }
      ]
    }
  };
  callSendAPI(messageData);
}


function sendLanguage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Please choose a language, you would like to train today",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Javascript",
          "payload":"javascript",
          "image_url":"http://ecodile.com/wp-content/uploads/2015/10/node_icon2.png"
        },
        {
          "content_type":"text",
          "title":"Python",
          "payload":"python",
          "image_url":"https://insidehpc.com/wp-content/uploads/2016/01/Python-logo-notext.svg_.png"
        },
        {
          "content_type":"text",
          "title":"Ruby",
          "payload":"ruby",
          "image_url":"https://cdn.dribbble.com/users/2156/screenshots/988487/slice_1_1x.png"
        },
        {
          "content_type":"text",
          "title":"C#",
          "payload":"csharp",
          "image_url":"https://raw.githubusercontent.com/isocpp/logos/master/cpp_logo.png"
        }
      ]
    }
  };
  callSendAPI(messageData);
}



function startTest(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: `Choose the languange`,
      quick_replies: [
        {
          "content_type":"text",
          "title":"Javascript",
          "payload": "javascript quiz",
          "image_url": "http://ecodile.com/wp-content/uploads/2015/10/node_icon2.png"
        },
        {
          "content_type":"text",
          "title":"Python",
          "payload": "python quiz",
          "image_url": "https://www.python.org/static/opengraph-icon-200x200.png"
        }
      ]
    }
  };
  callSendAPI(messageData);
}

function quest(recipientId, id = 0) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: arrOfQuest[id].quest,
      quick_replies: []
    }
  };
  for (let i = 0; i < arrOfQuest[id].title.length; i++) {
    let obj = {
      "content_type":"text",
      "title":arrOfQuest[id].title[i],
      "payload": arrOfQuest[id].payload[i]
    };
    messageData.message.quick_replies.push(obj);
  };
 delay(callSendAPI, 200, messageData);
}

const delay = function (func, wait, ...args) {
  setTimeout(function(){
    return func.apply(null, args);
  }, wait);
};
/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons:[{
            type: "account_link",
            url: SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;

const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express().use(body_parser.json())
app.use(body_parser.urlencoded({ extended: true }));

const port = 3000;
const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

app.get('/', (req, res) => {
    console.log("page loaded");
    res.status(200).send("Hello World!")
})

app.get('/webhook', (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let verify_token = req.query["hub.verify_token"];



    if (mode && verify_token) {
        if (mode === "subscribe" && verify_token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(403);
        }
    }
})
async function ReplyMessage(msg, phno, sender) {
    try {
        const response = await axios({
            method: "post",
            url: `https://graph.facebook.com/v16.0/${phno}/messages?access_token=${token}`,
            data: {
                messaging_product: "whatsapp",
                to: sender,
                text: {
                    body: msg
                }
            },
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log(`Response from Facebook Graph API: ${response.status} ${response.statusText}`);
    } catch (error) {
        console.error('Error sending message:', error.message);
        console.error('Error details:', error.response.data);
    }
}
app.post('/webhook', async (req, res) => {
    console.log("post entered");
    let body_param = req.body;
    //console.log(JSON.stringify(body_param,null,2));
    if (body_param.object) {

        if (body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]
        ) {

            const phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body_param.entry[0].changes[0].value.messages[0].from;

            if (body_param.entry[0].changes[0].value.messages[0].type === 'text' &&
                body_param.entry[0].changes[0].value.messages[0].text &&
                body_param.entry[0].changes[0].value.messages[0].text.body
            ) {
                const msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
                const mail = process.env.MAIL ;
                const apikey=process.env.JIRA_API_KEY ;
                const key = `${mail}:${apikey}`;
                
                try {
                    const response = await axios.post(
                        "https://coolsite42.atlassian.net/rest/api/3/issue",
                        {
                            "fields": {
                                "summary": msg_body,
                                "issuetype": {
                                    "id": "10001"
                                },
                                "project": {
                                    "id": "10000"
                                },
                            },
                        }, {
                        headers: {
                            'Authorization': `Basic ${Buffer.from(
                                key
                            ).toString('base64')}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    });
                    console.log(`Response from Jira: ${response.status} ${response.statusText}`);
                    console.log(response.data)

                    res.status(200).send("Request success");
                } catch (error) {
                    console.log(error);
                    await ReplyMessage('An error occurred while sending the message to Jira. Try after some time', phone_no_id, from);
                    res.status(418).send('An error occurred while sending the message to Jira');
                }
            } else {
                console.log("Check Message type only text is supported !");
                await ReplyMessage('Check Message type only text is supported !', phone_no_id, from);
                res.sendStatus(202);
            }
        } else {
            res.sendStatus(400);
        }
    }else{
        res.sendStatus(400);
    }
})

app.listen(process.env.PORT, () => console.log(`WebHook listening on port ${port}!`))
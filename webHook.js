const express =require('express') ;
const body_parser =require('body-parser');
const bodyParser =require('body-parser');
const axios  =require('axios');
require('dotenv').config() ;

const app = express().use(body_parser.json())
const port = 3000
const token = process.env.TOKEN ;
const mytoken = process.env.MYTOKEN ;

app.get('/',(req,res)=>{
    console.log("page loaded");
    res.status(200).send("Hello World!")
})

app.get('/webhook', (req, res) => {
    let mode = req.query["hub.mode"] ;
    let challenge = req.query["hub.challenge"] ;
    let token = req.query["hub.verify_token"] ;

   

    if(mode && token){
        if(mode === "subscribe" && token===mytoken){
            res.status(200).send(challenge) ;
        }else{
            res.status(403) ;
        }
    }
})

app.post('/webhook',(req,res)=>{
    console.log("post entered");
    let body_param=req.body ;

    //console.log(JSON.stringify(body_param,null,2));
    if(body_param.object){
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]
            ){
                let phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id ;
                let from = body_param.entry[0].changes[0].value.messages[0].from ;
                let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body ;
                let key = process.env.MAIL+":"+process.env.JIRA_API_KEY ;
                
                axios({
                    method:'post',
                    url:"https://coolsite42.atlassian.net/rest/api/3/issue",
                    data:
                        `{
                            "fields": {
                              "summary": "${msg_body}",
                              "issuetype": {
                                "id": "10001"
                              },
                              "project":{
                                "id":"10000"
                              }
                            }
                          }`
                    ,
                    headers:{
                        'Authorization': `Basic ${Buffer.from(
                            key
                        ).toString('base64')}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    console.log(response);
                  }).catch(function (error) {
                    console.log(error);
                  });
                res.status(200).send("Request success") ;
            }else{
                res.sendStatus(404) ;
            }
    }
})

app.listen(process.env.PORT, () => console.log(`WebHook listening on port ${port}!`))
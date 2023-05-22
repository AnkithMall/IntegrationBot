

import { config } from "dotenv";
config();

const key = process.env.MAIL+":"+process.env.JIRA_API_KEY ;

fetch('https://coolsite42.atlassian.net/rest/api/3/issue/10001', {
  method: 'GET',
  headers: {
    'Authorization': `Basic ${Buffer.from(
      key
    ).toString('base64')}`,
    'Accept': 'application/json'
  }
})
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    console.log("hi");
    //console.log(response.body);
    return response.json();
  })
  .then(text => console.log(text.fields.summary))
  .catch(err => console.error(err));

//create issue
const summary = "this is api issue"
const bodyData = `{
  "fields": {
    "summary": "${summary}",
    "issuetype": {
      "id": "10001"
    },
    "project":{
      "id":"10000"
    }
  }
}`;

fetch('https://coolsite42.atlassian.net/rest/api/3/issue', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(
      key
    ).toString('base64')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: bodyData
})
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));
  
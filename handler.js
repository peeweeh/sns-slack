console.log('Loading function');
const util = require('util');
const https = require('https');
const url = require('url');

const slack_req_opts = url.parse(process.env.webhook);
slack_req_opts.method = 'POST';
slack_req_opts.headers = {'Content-Type': 'application/json'};

exports.slack = function(event, context) {
  (event.Records || []).forEach(function (rec) {
    if (rec.Sns) {
      var req = https.request(slack_req_opts, function (res) {
        if (res.statusCode === 200) {
          context.succeed('posted to slack');
        } else {
          context.fail('status code: ' + res.statusCode);
        }
      });
      
      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        context.fail(e.message);
      });
      
      

      obj = JSON.parse(rec.Sns.Message);
        var attachment_payload = {
      attachments: [
        {
            fallback: "fallback",
            text: rec.Sns.Message,
            pretext: "Event",
            "color": "#333",
            fields: obj
        }    
      ]
  };

      payload_string = util.format("%j", attachment_payload);

     req.write(payload_string);
      
      req.end();
    }
  });
};
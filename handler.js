const util = require( 'util' );
const https = require( 'https' );
const url = require( 'url' );
const prettyjson = require( 'prettyjson' );
const slack_req_opts = url.parse( process.env.webhook );
slack_req_opts.method = 'POST';
slack_req_opts.headers = { 'Content-Type': 'application/json' };

exports.slack = function( event, context ) {
  console.log( 'Loading function' );
  ( event.Records || [ ] ).forEach( function( rec ) {
    if ( rec.Sns ) {
      var req = https.request( slack_req_opts, function( res ) {
        if ( res.statusCode === 200 ) {
          context.succeed( 'posted to slack' );
        } else {
          context.fail( 'status code: ' + res.statusCode );
        }
      } );

      req.on( 'error', function( e ) {
        console.log( 'problem with request: ' + e.message );
        context.fail( e.message );
      } );
      
      var jsontext = prettyjson.render( rec.Sns.Message, {
        keysColor: 'rainbow',
        dashColor: 'magenta',
        stringColor: 'white'
      } );

      var attachment_payload = {
        attachments: [
          {
            "author_name": rec.EventSource,
            "title": rec.Sns.Subject,
            fallback: "rec.Sns.Subject",
            text: jsontext,
            "footer": rec.EventSubscriptionArn,
            "color": "#36a64f"
        }
      ]
      };

      payload_string = util.format( "%j", attachment_payload );

      req.write( payload_string );

      req.end( );
    }
  } );
};

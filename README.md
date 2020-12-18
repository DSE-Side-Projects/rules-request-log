# Auth0 Rules Requests Log

This serverless function helps Auth0 Developer Support Engineers to debug and troubleshoot outbound requests from Auth0 Rules.

##

Add this Rule to your Auth0 tenant as the last Rule on the list, and if you experience issues with outbound requests in one of the previous Rules, disable it during troubleshooting.

```javascript
async function (user, context, callback) {
  const fetch = require("node-fetch");
  const url = "https://tools.dseapps.dev/api/request-log";
  const tenant = context.tenant;

  // This allows you to see output in Real-time Webtask extension
  console.log(await fetch(url, {
    method: "POST",
    body: JSON.stringify({ tenant, context, user})
  }));
  
  return callback(null, user, context);
}
```

You can also check the output using Real-time Webtask extension.

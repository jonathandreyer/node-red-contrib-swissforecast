
module.exports = function(RED) {
    "use strict";
    var baseurl = "https://app-prod-ws.meteoswiss-app.ch/v1/stationOverview?station=";

    function FetchData(config) {
      RED.nodes.createNode(this,config);
      var node = this;
      var http;
      if (baseurl.substring(0,5) === "https") { http = require("https"); }
      else { http = require("http"); }
      this.url = baseurl + config.location;

      node.on('input', function(msg) {
        if (config.hasOwnProperty("location")) {
          http.get(this.url, function(response) {
              msg.status = response.statusCode;
              msg.response = "";
              response.setEncoding('utf8');
              response.on('data', function(chunk) {
                  msg.response += chunk;
              });
              response.on('end', function() {
                  if (response.statusCode === 200) {
                      try {
                          var result = JSON.parse(msg.response);
                          msg.payload = result[config.location];
                      }
                      catch(err) {
                          // Failed to parse, pass it on
                      }
                      node.send(msg);
                  }
              });
          }).on('error', function(err) {
              node.error(err,msg);
          });
        } else { node.warn(RED._("swissforecast.errors.location")); }
      });
    }
    RED.nodes.registerType("swissforecast",FetchData);
}

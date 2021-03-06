/**
 * A client for Microsoft's Bing Search API v2 on Node.js
 * Copyright(c) 2013 Adrian Statescu <mergesortv@gmail.com>
 * Source covered by the MIT License
 */

var request = require('request'),
    url = require('url'),
    _ = require('underscore'),
    qs = require('querystring');

var Bing = function( options ) {

    if( !(this instanceof Bing) ) return new Bing( options )

    var defaults = {
        //Endpoint Microsoft's Bing API REST GET
        endpoint: "http://api.bing.net/json.aspx?",
        //Appid
        appId: null,
        //SourceType: Web,Image,News, PhoneBook, RelatedSearch, Translation, Spell
        sources: "web",
        //Bing amount of items response
        limit: 10,
        //offset results
        offset: 0, 
        //Bing UserAgent
        userAgent: 'Bing Search Client for Node.js',
        //Bing Api version
        version: "2.2"
    };

    //merge options passed in with defaults
    this.options = _.extend(defaults, options)
}


Bing.prototype.search = function(query, callback, options) {
 
     if(typeof callback != 'function') {

        throw "Erorr: Callback function required!" 
        return
     }

     var opts = this.options;

     if(options != null) {

        opts = _.extend(this.options, options)
     }

     var uri = opts.endpoint + qs.stringify({
               "Appid": opts.appId,
               "query": query,  
               "sources": opts.sources,
               "web.count": opts.limit,
               "web.offset": opts.offset})
     
     request({

          uri: uri,
          method: opts.method || "GET",
          headers: {
                  "User-Agent": opts.userAgent
          },
          timeout: 2000

     }, function(error, response, body){

          if(!error && response.statusCode >= 200 && response.statusCode < 300) {

             //the error could be in the body because bing returns 200 for failed requests
             var data = JSON.parse(body)

             if(data && data.SearchResponse.Errors && data.SearchResponse.Errors.length > 0) {

                  error = new Error("Bing API Error: (" + data.SearchResponse.Errors.length + " errors): See remoteErrors for details ")
                  error.remoteErrors = data.SearchResponse.Errors;
             } 

             callback( error, response, JSON.parse( body ) )
           
          //otherwise should be something interesting here...  
          } else {

            callback(error, response, body) 
          }
     })
}

Bing.version = "0.0.1"

module.exports = Bing
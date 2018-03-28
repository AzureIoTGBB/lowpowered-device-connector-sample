module.exports = function (context, req) {
    context.log('Event received', req.body);  

    msg = req.body;     
    
    var Protocol = require('azure-iot-device-mqtt').Mqtt;
    var Client = require('azure-iot-device').Client;
    var Message = require('azure-iot-device').Message;
    var request = require('request');
    var Async = require('async');

    //get configuration
    var host = process.env['IoTHubHost'];    
    var key = process.env['IoTHubDevicePolicyKey'];
    var keyName = process.env['IoTHubDevicePolicyName'];
    var configurationApi = process.env['configurationApi'];

    //get device id / DevEUI
    var deviceId = msg.DevEUI;
    var config={                       
                        decoder:'',
                        twin:'',
                        formatter:''
                   };  

    //create sas - this is a work around as the nodejs sdk does not currently support policy authentication
    var expiry = (new Date() / 1000) + 3600; // an hour from now in seconds. Customers should pick their own expiry
    var deviceUri = encodeURIComponent(host + '/devices/' + deviceId);
    var sas = require('azure-iot-common').SharedAccessSignature.create(deviceUri, keyName, key, expiry);

    //connect to iothub
    var client = Client.fromSharedAccessSignature(sas, Protocol);

    //get device type configuration   
    function getConfiguration(callback) {        
        context.log('Getting configuration');        
                
        request(configurationApi + '&type=' +msg.DeviceType, function(error, response, body){            
            if (!error && response.statusCode == 200)            
                config = JSON.parse(body);  
            else
                context.log('Error getting configuration:', error);                   

            callback(null, config);   
        });        
    }

    //call decoder
    function decodePayload(config, callback) {
        context.log('Decoding payload');
        
        var url = config.decoder + '&payload=' + msg.payload_hex;
        var decoded=msg.decoded_payload;       

        if((config.decoder == '')||(msg.decoded_payload !='')){
            decoded = msg.decoded_payload; 
            context.log('Decoded:', decoded); 
            callback(null, decoded);          
        }  
        else{ 
                request(url, function(error, response, body){            
                    if (!error && response.statusCode == 200) {                   
                        decoded = JSON.parse(body);  
                        context.log('Decoded:', decoded);
                    }
                    else
                        context.log('Error getting configuration:', error);   

                    callback(null, decoded);                   
                });  
        }       
    }
    
    //string formatter
    function format(str) {
        var args = [].slice.call(arguments, 1), i = 0;

        return str.replace(/%s/g, function() {
        return args[i++];
        });
    }

    //send message  
    function sendMessage(decoded, callback) {
        context.log('Sending message: ', decoded);
        
        var url = 'https://mqconnector.azurewebsites.net/api/formatter-pcs?code=SShlw1sbZUOI8pKaa2nOadZ1fa8Izqs4lrVWwdk9PgrAcaRGACaYEg==' + '&payload=' + JSON.stringify(decoded);
        var msg='';

        //get formatted message
        request(url, function(error, response, body){            
                    if (!error && response.statusCode == 200) {                   
                        msg = JSON.parse(body);  
                        context.log('Message formatted:', msg);

                        var message = new Message(JSON.stringify(msg.telemetry));
                        for (var i = 0, len = msg.properties.length; i < len; i++) {
                            message.properties.add(msg.properties[i].name, msg.properties[i].value);
                        }   
                        client.sendEvent(message);
                    }
                    else
                        context.log('Error formatting message:', url);
        });  
          
        callback(null, 'done');   
    }
    
    Async.waterfall([getConfiguration, decodePayload, sendMessage], function (error, result) {
        if (!error)         
            context.log('Message sent - no errors');
        else
            context.log('Error sending message', error);

        context.done();
    });    
};
module.exports = function (context, req) {
    
    var payload = JSON.parse(req.query.payload);
    var date = new Date();

    context.log('Payload to format ', payload.temperature )

    var data = {                
                temperature:payload.temperature, 
                temperature_unit:"F"
    };  
    
    
    var message = {
                        telemetry:data,
                        properties:[
                            {name:'$$CreationTimeUtc',value:date.toISOString()},
                            {name:'$$MessageSchema',value:'chiller-temperature;v1'},
                            {name:'$$ContentType',value:'JSON'},
                        ]
        };         
       
        
    context.res = {status:200, body:message };
    context.done();    
};
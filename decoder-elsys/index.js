module.exports = function (context, req) {

 context.log('full payload:' + req.body.DevEUI_uplink);

 context.log('requested:' + JSON.stringify(req));

    /**

	In this editor, you can define your custom javascript code to parse the incoming data.	
	
	The following variables are available:
	
	data     : hex string of the data
	p	     : array of bytes represented as string of 2 hex digits 
	v        : array of bytes represented as integers
	msg.EUI  : device EUI
	msg.fcnt : message frame counter
	msg.port : message port field
	msg.ts   : message timestamp as number (epoch)
	
	Last line of your script will be printed to the data payload column.

 
    ELSYS simple payload decoder. 
    Use it as it is or remove the bugs :)
    www.elsys.se
    peter@elsys.se
*/
const TYPE_TEMP    	=0x01; //temp 2 bytes -3276.8°C -->3276.7°C
const TYPE_RH		=0x02; //Humidity 1 byte  0-100%
const TYPE_ACC		=0x03; //acceleration 3 bytes X,Y,Z -128 --> 127 +/-63=1G
const TYPE_LIGHT	=0x04; //Light 2 bytes 0-->65535 Lux
const TYPE_MOTION	=0x05; //No of motion 1 byte  0-255
const TYPE_CO2		=0x06; //Co2 2 bytes 0-65535 ppm 
const TYPE_VDD		=0x07; //VDD 2byte 0-65535mV
const TYPE_ANALOG1  =0x08; //VDD 2byte 0-65535mV
const TYPE_GPS      =0x09; //3bytes lat 3bytes long binary
const TYPE_PULSE1   =0x0A; //2bytes relative pulse count

function bin16dec(bin) {
    var num=bin&0xFFFF;
    if (0x8000 & num)
        num = - (0x010000 - num);
    return num;
}
function bin8dec(bin) {
    var num=bin&0xFF;
    if (0x80 & num) 
        num = - (0x0100 - num);
    return num;
}
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function DecodeElsysPayload(data){
    var obj ={};
    for(i=0;i<data.length;i++){
        switch(data[i]){
            case TYPE_TEMP: //Temperature
                var temp=(data[i+1]<<8)|(data[i+2]);
                temp=bin16dec(temp);
                obj.temperature=temp;
                i+=2;
            break;
            case TYPE_RH: //Humidity
                var rh=(data[i+1]);
                obj.humidity=rh;
                i+=1;
            break;
            case TYPE_ACC: //Acceleration
                obj.x=bin8dec(data[i+1]);
                obj.y=bin8dec(data[i+2]);
                obj.z=bin8dec(data[i+3]);
                i+=3;
            break;
            case TYPE_LIGHT: //Light
                var light=(data[i+1]<<8)|(data[i+2]);
                obj.light=light;
                i+=2;
            break;
            case TYPE_MOTION: //Motion sensor(PIR)
                var motion=(data[i+1]);
                obj.motion=motion;
                i+=1;
            break;
            case TYPE_CO2: //CO2
                var co2=(data[i+1]<<8)|(data[i+2]);
                obj.co2=co2;
                i+=2;
            break;
            case TYPE_VDD: //Battery level
                var vdd=(data[i+1]<<8)|(data[i+2]);
                obj.vdd=vdd;
                i+=2;
            break;
            case TYPE_ANALOG1: //Analog input 1
                var analog1=(data[i+1]<<8)|(data[i+2]);
                obj.analog1=analog1;
                i+=2;
            break;
            case TYPE_GPS: //gps
                obj.lat=(data[i+1]<<16)|(data[i+2]<<8)|(data[i+3]);
                obj.long=(data[i+4]<<16)|(data[i+5]<<8)|(data[i+6]);
                i+=6;
            break;
            case TYPE_PULSE1: //Pulse input 1
                var pulse1=(data[i+1]<<8)|(data[i+2]);
                obj.pulse1=pulse1;
                i+=2;
            break;
        }
    }
    return obj;
}

    
    var res=DecodeElsysPayload(hexToBytes(req.body.DevEUI_uplink.payload_hex))
    var json=JSON.stringify(res,null,4);
    json;

    context.log('decoded:'+json);
    context.bindings.outputEventHubMessage = json;    
    context.done(null, res);
};
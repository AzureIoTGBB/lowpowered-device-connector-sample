module.exports = function (context, req) {
    context.log('Decoder requested');

    function parsePayload(payload) {
        buf = Buffer.from(payload, 'hex');
        length = buf.length;
        returnPayload = {};

        base = 0;
        context.log('length = ', length);
        context.log('buffer is ', buf);

        while (length > base) {
            thisLookup = typeLookupTable(buf[base + 1]);
            offset = thisLookup.offset;

            if (!returnPayload[buf[base]]) {
            returnPayload[buf[base]] = {};
            }

            returnPayload[buf[base]][buf[base + 1]] = {
                type: typeLookupTable(buf[base + 1]).type,
                data: calcData(thisLookup.type,
                buf.toString('hex', base + 2, base + 2 + offset)
                ),
            };
            base = (base + 2 + offset);
        }
    
        return returnPayload;
    }

   

    function typeLookupTable(hexValue) {
    lookupHash = {
        0: { type: 'Digital Input', offset: 1 },
        1: { type: 'Digital Output', offset: 1 },
        2: { type: 'Analog Input', offset: 2 },
        3: { type: 'Analog Output', offset: 2 },
        61: { type: 'SengLED power status', offset: 1 },
        62: { type: 'Digital Output', offset: 1 },
        63: { type: 'Digital Output 2', offset: 1 },
        64: { type: 'RGBW', offset: 4 },
        101: { type: 'Illuminance Sensor', offset: 2 },
        102: { type: 'Presence Sensor', offset: 1 },
        103: { type: 'Temperature Sensor', offset: 2 },
        104: { type: 'Humidity Sensor', offset: 1 },
        113: { type: 'Accelerometer', offset: 6 },
        115: { type: 'Barometer', offset: 2 },
        134: { type: 'Gyrometer', offset: 6 },
        136: { type: 'GPS Location', offset: 9 },
    };
    return lookupHash[hexValue];
    }

    function calcData(dataType, data) {
    switch (dataType) {

        case 'Illuminance Sensor':
        return hexToInt(data) * 0.01;

        case 'Temperature Sensor':
        return parseFloat(hexToInt(data) * 0.1).toFixed(2);

        case 'Humidity Sensor':
        return hexToInt(data) * 0.5;

        case 'Accelerometer':
        hash = {
            x: hexToInt(data.slice(0, 2)) * 0.001,
            y: hexToInt(data.slice(2, 4)) * 0.001,
            z: hexToInt(data.slice(4, 6)) * 0.001,
        };
        return hash;

        case 'Barometer':
        return hexToInt(data) * 0.1;

        case 'Gyrometer':
        hash = {
            x: hexToInt(data.slice(0, 2)) * 0.01,
            y: hexToInt(data.slice(2, 4)) * 0.01,
            z: hexToInt(data.slice(4, 6)) * 0.01,
        };
        return hash;

        case 'GPS Location': //GPS
        hash = {
            lat: hexToInt(data.slice(0, 6)) * 0.0001,
            lon: hexToInt(data.slice(6, 12)) *  0.0001,
            alt: hexToInt(data.slice(12, 18)) * 0.01,
        };
        return hash;

        case 'RGBW': //GPS
        hash = {
            R: hexToInt(data.slice(0, 2)) * 0.01,
            G: hexToInt(data.slice(2, 4)) * 0.01,
            B: hexToInt(data.slice(4, 6)) * 0.01,
            W: hexToInt(data.slice(6, 8)) * 0.01,
        };
        return hash;

        default:
        return hexToInt(data);
    }
    }

    function hexToInt(hex) {
        if (hex.length % 2 !== 0) {
            hex = 0 + hex;
    }

    num = parseInt(hex, 16);
    maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
        num = num - maxVal;
    }

    return num;
    }

    context.res ={status:200, body: parsePayload(JSON.stringify(req.query.payload))};
    context.log('Decoder proccessed a msg');


    context.done();
};
# Sample IoT Hub to LoRaWAN Bridge

Low Power Networks (LPN) represents a tremendous opportunity to the Internet of Things. Their low range and incredible battery efficiency enable solutions developer to create the Internet of ALL Things. Today there are many LPN options available, each providing unique advantages and disadvantages.  Because of its diverse ecosystem and unrestrictive radio requirements, LoRAWAN is emerging as one of the favorites. While the concepts discussed in this sample applies to other LPN, we will focus only on LoRAWAN.

In LoRaWAN, devices are not able to connect directly with IoT Hub or any cloud service for that matter. Instead, devices (Motes) connect to one or more gateways which then send all messages to a "Network Server." The network server takes all the duplicate messages and presents one message to an "Application Server." In LoRaWAN, the application server is the entity that makes use of the device (data, commands, etc.). In our sample, the application server is the bridge to IoT Hub. Configuring the application server varies on the network server you are using. For our example, we configured the network server to forward data to an https endpoint. 

>Note: I considered using MQTT so that we could maintain an open connection between IoT Hub and the bridge, but opted against it given the disconnected nature of LoRa devices (at least class A).

## Implementing the Bridge

The first decision we had to make was where to host the bridge. The first option that came up was to implement it as an Actor based service in Azure Service Fabric where an actor would represent each device. I opted against it since I was not very familiar with the Actor framework and there was a bit of a time constraint. After considering other options, I chose to implement the bridge using Azure Functions because of its small learning curve, scaling features and how quick it was to get started.

### Azure Function

I broke down the functionality into multiple Azure Function to make it easily extensible. The idea is that you could have different device types on the bridge and therefore might need separate a decoder, twin, message format, etc. 

>Note: I used nodejs and the async package in this sample but looking back I should have gone with Azure Durable Functions as it was designed for this type of "pipeline" scenarios.
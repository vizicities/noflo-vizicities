var noflo = require("noflo");

// TODO: Should this use ArrayPort for the in port?
// - Use the addressible property to set that
// - http://noflojs.org/documentation/components/
// - If so, does it need to use the arrayPolicy config?
// - http://noflojs.org/api/Helpers.html
// - Also, use the 
// TODO: Should the in port be using the buffered property?
// - http://noflojs.org/documentation/components/
exports.getComponent = function() {
  var AddPropertyValue = new noflo.Component();
  AddPropertyValue.description = "This component adds a property and value to the given object";

  // Store manual reference to value port group
  // TODO: Find a better way to forward only 1 select group to out
  var valueGroup = "";

  var config = {
    in: ["in", "value"],
    params: ["property"],
    out: "out",
    group: true, // Wait for packets of same group
    // This duplicates groups when group: true
    forwardGroups: ["value"],
    // Everything works when this is true, but is it right?
    async: true,
    arrayPolicy: {
      in: "any", // Wait for all indexes
      params: "all" // Wait for all indexes
    }
  };

  AddPropertyValue.inPorts = new noflo.InPorts({
    // What are the ramification of in not being an ArrayPort / addressible?
    in: {
      datatype: "object"
    },
    property: {
      datatype: "string",
      required: true
    },
    value: {
      datatype: "string"
    }
  });

  AddPropertyValue.inPorts.value.on("begingroup", function(group) {
    valueGroup = group;
  });

  AddPropertyValue.outPorts = new noflo.OutPorts({
    out: {
      datatype: "all"
    }
  });

  noflo.helpers.WirePattern(AddPropertyValue, config, function(data, groups, outPort, asyncCb) {
    // console.log(data, groups);
    // console.log(AddPropertyValue);

    // Is this covered by forwardGroups?
    // outPort.beginGroup(valueGroup);

    data.in[AddPropertyValue.params.property] = data.value;

    // Data is an object of ports when using multiple in ports in the config
    // Otherwise, it's a direct reference to the packet of the in port
    outPort.send(data.in);

    // Is this covered by forwardGroups?
    // outPort.endGroup();

    // Is it right to force a disconnect here?
    // Without it the out port never disconnects and so the graph waits forever
    //outPort.disconnect();

    asyncCb();
  });

  // Return new instance
  return AddPropertyValue;
};
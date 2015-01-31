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
  var WrapWithGroup = new noflo.Component();
  WrapWithGroup.description = "This component wraps the in packet with a group";

  var config = {
    in: ["in"],
    params: ["group"],
    out: "out",
    arrayPolicy: {
      in: "any", // Trigger on any index
      params: "all" // Wait for all indexes
    }
  };

  WrapWithGroup.inPorts = new noflo.InPorts({
    // What are the ramification of in not being an ArrayPort / addressible?
    in: {
      datatype: "string"
    },
    group: {
      datatype: "string",
      required: true
    }
  });

  WrapWithGroup.inPorts.in.on("begingroup", function(group) {
    WrapWithGroup.outPorts.out.beginGroup(group);
  });
  
  WrapWithGroup.inPorts.in.on("endgroup", function(group) {
    WrapWithGroup.outPorts.out.endGroup(group);
  });

  WrapWithGroup.outPorts = new noflo.OutPorts({
    out: {
      datatype: "all"
    }
  });

  noflo.helpers.WirePattern(WrapWithGroup, config, function(data, groups, outPort) {
    outPort.beginGroup(WrapWithGroup.params.group);

    // Data is an object of ports when using multiple in ports in the config
    // Otherwise, it's a direct reference to the packet of the in port
    outPort.send(data);

    outPort.endGroup();

    // Is it right to force a disconnect here?
    // Without it the out port never disconnects and so the graph waits forever
    // outPort.disconnect();
  });

  // Return new instance
  return WrapWithGroup;
};
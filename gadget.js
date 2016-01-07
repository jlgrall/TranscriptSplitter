(function($, undefined) {
'use strict';
	
	var Array_slice = Array.prototype.slice;
	
	// Inspired by: http://api.jqueryui.com/jQuery.widget/
	$.gadget = function(gadgetName, Constr) {
		
		var gadgetFullName = "gadget-" + gadgetName,
			gadget = $.fn[gadgetName] = function(methodName) {
				// Call method for each element:
				for(var i = 0; i < this.length; i++) {
					var elem = this[i],
						$elem,
						instance = $.data(elem, gadgetFullName),	// Get the instance for element
						args,
						destroy = methodName === "destroy";
					
					// Create instance if needed:
					if(!instance && !destroy) {
						$elem = $(elem);
						args = Array_slice.call(arguments);
						args.unshift(undefined, $elem);
						// From: http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/8843181#8843181
						// "Equivalent" to: new (Constr.apply(args))
						instance = new (Function.prototype.bind.apply(Constr, args));
						$elem.data(gadgetFullName, instance);
						var eventData = {gadgetName: gadgetName, instance: instance};
						$elem.trigger(gadgetName + ":create", eventData);
						$elem.trigger("gadget:create", eventData);
					}
					else if(instance && (!destroy || instance[methodName])) {
						// Check method name and get method arguments:
						if($.type(methodName) !== "string") $.error("Missing methodName: must be provided as first argument !");
						args = Array_slice.call(arguments, 1);
					
						// Call the method:
						var retValue = instance[methodName].apply(instance, args);
						// If the method is a getter, return the value
						// (See: http://bililite.com/blog/2009/04/23/improving-jquery-ui-widget-getterssetters/)
						if(retValue !== instance && !destroy) {
							return retValue;
						}
					}
					
					if(destroy && instance) {
						$elem = $(elem);
						var eventData = {gadgetName: gadgetName, instance: instance};
						$elem.removeData(gadgetFullName);
						$elem.trigger(gadgetName + ":destroy", eventData);
						$elem.trigger("gadget:destroy", eventData);
					}
				}
			
				return this;	// Chaining
			};
		
		gadget.constr = Constr;
		gadget.prototype = Constr.prototype;
		
		return gadget;
	};
	
}(jQuery));
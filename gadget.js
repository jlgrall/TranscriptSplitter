(function($, undefined) {
'use strict';
	
	var Array_slice = Array.prototype.slice;
	
	// Inspired by: http://api.jqueryui.com/jQuery.widget/
	$.gadget = function(gadgetName, Constr) {
		
		var gadgetFullName = "gadget-" + gadgetName,
			gadget = $.fn[gadgetName] = function(methodName) {
				// Call method for each element:
				var elem, instance, args, retValue;
				for(var i = 0; i < this.length; i++) {
					elem = this[i];
					
					// Get the instance object or create it:
					instance = $.data(elem, gadgetFullName);
					if(!instance) {
						args = Array_slice.call(arguments);
						args.unshift(undefined, $(elem));
						// From: http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/8843181#8843181
						// "Equivalent" to: new (Constr.apply(args))
						instance = new (Function.prototype.bind.apply(Constr, args));
						$.data(elem, gadgetFullName, instance);
					}
					else {
						// Check method name and get method arguments:
						if($.type(methodName) !== "string") $.error("Missing methodName: must be provided as first argument !");
						args = Array_slice.call(arguments, 1);
					
						// Call the method:
						retValue = instance[methodName].apply(instance, args);
						// If the method is a getter, return the value
						// (See: http://bililite.com/blog/2009/04/23/improving-jquery-ui-widget-getterssetters/)
						if(retValue !== instance) {
							return retValue;
						}
					}
				}
			
				return this;	// Chaining
			};
		
		gadget.constr = Constr;
		gadget.prototype = Constr.prototype;
		
		return gadget;
	};
	
}(jQuery));
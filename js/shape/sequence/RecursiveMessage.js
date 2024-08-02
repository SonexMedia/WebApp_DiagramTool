var CLASS_RECURSIVEMESSAGE								= CLASS_BASIC.extend(function(x, y, model, canvas){
	"use strict";
	/*private variable*/
	var self = this;
	MyEvents.apply(this);
    //class constructor
	
    self.constructor 							= function(x, y, model, canvas){
		
		self.super(x, y, model, canvas);

		var shape 	= self;
		var option 	= {
			's_point': new fabric.Point(x - 50, y),
			'e_point': new fabric.Point(x + 50, y + 50),
			'rshape_name': 'triangle-fill',
			'line_type': 'type-1',
			'e_connector': shape.connectors[7]
		};
		var line = new CLASS_LINE( canvas, option );
		line._center_selector.set({left: x + 70});
		
		line.fireEvent("update", { 'target': line._center_selector });
		canvas.renderAll();
    };
});

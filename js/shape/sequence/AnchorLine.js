var CLASS_ANCHORLINE								= CLASS_BASIC.extend(function(x, y, model, canvas, options){
	"use strict";
	/*private variable*/
	var self = this;
	MyEvents.apply(this);
    //class constructor
    self.constructor 							= function(x, y, model, canvas, options){
		
		self.super(x, y, model, canvas);

		var option = {
			's_point': new fabric.Point(x - 50, y),
			'e_point': new fabric.Point(x + 50, y),
			'line_style': 'style-2',
		};
		
		// new CLASS_LINE( canvas, option );
		// canvas.renderAll();
    };
});

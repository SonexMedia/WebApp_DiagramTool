var CLASS_FOUNDMESSAGE								= CLASS_BASIC.extend(function(x, y, model, canvas){
	"use strict";
	/*private variable*/
	var self = this;
	MyEvents.apply(this);
    //class constructor
    self.constructor 							= function(x, y, model, canvas){
		
		self.super(x, y, model, canvas);

		return;
		
		var option = {
			's_point': new fabric.Point(x - 50, y),
			'e_point': new fabric.Point(x + 50, y),
			'lshape_name': 'circle-fill',
			'rshape_name': 'arrow',
		};
		
		new CLASS_LINE( canvas, option );
		canvas.renderAll();
    };
});

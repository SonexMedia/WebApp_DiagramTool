var CLASS_CONSTRAINT								= function(x, y, model, canvas){
	"use strict";
	/*private variable*/
	var self = this;
	self.canvas = canvas;
	self._text = null;
	
	MyEvents.apply(this);
    //class constructor
	
    self.constructor 							= function(x, y, model, canvas){
		
		self._text = new fabric.IText("{ --- }", {
			left: x,
			top: y,
			fontFamily: 'Arial',
			fontSize: 14,
			fontWeight: 'normal',
			fill: 'black',
			hasControls: false,
			hasBorders: true,
			originX: 'center',
			originY: 'center',
			class: 'text',
			self: self
		});
		
		self.canvas.add(self._text);
		self.canvas.renderAll();
    };
	
	{
		self.constructor(x, y, model, canvas);
	}
};

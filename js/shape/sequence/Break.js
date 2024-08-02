var CLASS_BREAK								= CLASS_BASIC.extend(function(x, y, model, canvas){
	"use strict";
	/*private variable*/
	var self = this;
	var rect = null;
	var line = null;
	/*public variable*/
	self.class_name = 'CLASS_BREAK';
	MyEvents.apply(this);
    //class constructor
    self.constructor 							= function(x, y, model, canvas){
		self.super(x, y, model, canvas);
		var obj = self.shape.getObjects();
		rect = obj[0];
		
		self.addEventListener("update", function(e) {
			var w = self.shape.getWidth();
			var h = self.shape.getHeight();
			self.shape.set({width: w, height: h, scaleX: 1, scaleY: 1});
			rect.set({width: w, height: h});
			
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("update");
				
			for(var i = 0; i < self._texts.length; i ++)
				self._texts[i].fireEvent("change1");
		});
    };
});

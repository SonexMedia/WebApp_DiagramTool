var CLASS_LIFELINE								= CLASS_BASIC.extend(function(x, y, model, canvas){
	"use strict";
	/*private variable*/
	var self = this;
	var rect = null;
	var line = null;
	/*public variable*/
	self.class_name = 'CLASS_LIFELINE';
	MyEvents.apply(this);
    //class constructor
    self.constructor 							= function(x, y, model, canvas){
		self.super(x, y, model, canvas);
		
		var obj = self.shape.getObjects();
		var cornerOptions = {
			tl: true,
            tr: true,
            br: true,
            bl: true,
            ml: true,
            mt: true,
            mr: true,
            mb: true,
            mtr: false
		};
		self.shape.setControlsVisibility(cornerOptions);
		rect = obj[0];
		rect.oleft = rect.left + self.shape.getWidth() / 2;
		rect.otop = rect.top + self.shape.getHeight() / 2;
		
		line = obj[1];
		line.otop = line.top - line.height / 2;
		console.log(line.otop + " , " + (self.shape.getHeight() - line.otop));
		self.addEventListener("update", function(e) {
			var w = self.shape.getWidth();
			var h = self.shape.getHeight();
			var r = rect.radius;
			var oP = self.shape.getCenterPoint();
			
			self.shape.set({width: w, height: h, scaleX: 1, scaleY: 1});
			rect.set({left: px, top: py, width: w });
			var height = h - line.otop;
			line.set({ left: w / 2, top: line.otop + height / 2, height: height });
			
			var px = (rect.oleft - w / 2);
			var py = (rect.otop - h / 2);
			rect.set({left: px, top: py });
			
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("update");
				
			for(var i = 0; i < self._texts.length; i ++)
				self._texts[i].fireEvent("change1");
		});
		var left = self.shape.left + line.left;
		var top = self.shape.top + line.top;
		var height = line.height;
		self.con_line = line;
		
		var connector = new CLASS_CONNECTORLINE(self, left, top, height, self.canvas);
		self.connectors.push( connector );
		T_Connectors.push( connector );
    };
});

var CLASS_ENTITYLIFELINE								= CLASS_BASIC.extend(function(x, y, model, canvas){
	"use strict";
	/*private variable*/
	var self = this;
	var circle = null;
	var line = null;
	/*public variable*/
	self.class_name = 'CLASS_ENTITYLIFELINE';
	MyEvents.apply(this);
    //class constructor
    self.constructor 							= function(x, y, model, canvas){
		self.super(x, y, model, canvas);
		
		var obj = self.shape.getObjects();
		var cornerOptions = {
			tl: false,
            tr: false,
            br: false,
            bl: false,
            ml: false,
            mt: false,
            mr: false,
            mb: true,
            mtr: false
		};
		self.shape.setControlsVisibility(cornerOptions);
		circle = obj[0];
		circle.oleft = circle.left + self.shape.getWidth() / 2;
		circle.otop = circle.top + self.shape.getHeight() / 2;
		
		line = obj[2];
		line.otop = line.top - line.height / 2;
		console.log(line.otop + " , " + (self.shape.getHeight() - line.otop));
		self.addEventListener("update", function(e) {
			var w = self.shape.getWidth();
			var h = self.shape.getHeight();
			var r = circle.radius;
			var oP = self.shape.getCenterPoint();
			
			self.shape.set({width: w, height: h, scaleX: 1, scaleY: 1});
			var height = h - line.otop;
			line.set({ top: line.otop + height / 2, height: height });
			
			var px = (circle.oleft - w / 2);
			var py = (circle.otop - h / 2);
			circle.set({left: px, top: py });
			
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

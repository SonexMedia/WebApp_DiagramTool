var CLASS_BASIC								= Class.extend(function(x, y, model, canvas){
	"use strict";
	/*private variable*/
	var self = this;
	/*public variable*/
	self.class_name = 'CLASS_BASIC';
	self.type = 'shape';
	
	self.shape = null;
	self.connectors = new Array();
	self._texts = new Array();
	self.min_width = 0;
	self.min_height = 0;
	self.canvas = null;
	
	MyEvents.apply(this);
    //class constructor
    self.constructor 							= function(x, y, model, canvas){
		self.canvas = canvas;
		self.addEventListener("MouseOver", function(e) {
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("MouseOver");
		});
		self.addEventListener("MouseOut", function(e) {
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("MouseOut");
		});
		self.addEventListener("Selected", function(e) {
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("Hide");
		});
		self.addEventListener("Cleared", function(e) {
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("Restore");
		});
		
		self.addEventListener("Delete", function(e) {
			for( var i = 0; i < self._texts.length; i ++)
				self._texts[i].deleteText();
			for( var i = 0; i < self.connectors.length; i ++ )
				self.connectors[i].deleteConnector();
			self.canvas.remove(self.shape);
			
			self.canvas.renderAll();
		});
		
		self.addEventListener("update", function(e)
		{
			var childObj 	= self.shape.getObjects();
			var strokeW 	= 1  / ((self.shape.getScaleX() + self.shape.getScaleY()) / 2);

			self.shape.set({strokeWidth: strokeW});

			for(var i = 0; i < childObj.length; i ++)
				childObj[i].set({strokeWidth: strokeW});

			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("update");

			for(var i = 0; i < self._texts.length; i ++)
				self._texts[i].fireEvent("change");
		});

		self.addEventListener("Hide", function(e)
		{
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("Hide");
				
			for(var i = 0; i < self._texts.length; i ++)
				self._texts[i].fireEvent("Hide");
		});

		self.addEventListener("Show", function(e)
		{
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("Show");
				
			for(var i = 0; i < self._texts.length; i ++)
				self._texts[i].fireEvent("Show");
		});

		self.addEventListener("bringFront", function(e)
		{
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("bringFront");
				
			for(var i = 0; i < self._texts.length; i ++)
				self._texts[i].fireEvent("bringFront");
		});

		self.addEventListener("sendBack", function(e)
		{
			for(var i = 0; i < self.connectors.length; i ++)
				self.connectors[i].fireEvent("sendBack");
				
			for(var i = 0; i < self._texts.length; i ++)
				self._texts[i].fireEvent("sendBack");
		});

		drawShape(x, y, model);
    };
	/*private method*/
	function setConnectors(points){
		var w = self.shape.getWidth();
		var h = self.shape.getHeight();
		for(var i = 0; i < points.length; i ++){
			var connector = new CLASS_CONNECTOR(self, points[i].x, points[i].y, self.canvas);
			self.connectors.push( connector );
			T_Connectors.push( connector )
		}
	};
	function initTexts( objs ){
		for(var i = 0; i < objs.length; i ++){
			var left = objs[i].x;
			var top = objs[i].y;
			var fontFamily = objs[i].fontFamily;
			var fontSize = objs[i].fontSize;
			var fontWeight = objs[i].fontWeight;
			var text = objs[i].text;
			self._texts.push( new CLASS_TEXT( self, text, left, top, fontFamily, fontSize, fontWeight, self.canvas ) );
		}
	};
	
	function drawShape(left, top, model){
		var obj = model;
		obj.clone(function (clone) {
			var sub_group = clone.getObjects();
			var connectors = new Array();
			var texts = new Array();
			
			var paths = new Array();
			for(var j = 0; j < sub_group.length; j ++){
				var sub_obj = sub_group[j];
				if( sub_obj.get('type') == 'path' && sub_obj.path.length == 1 ){
					//connector
					var point = {x : sub_obj.path[0][1], y: sub_obj.path[0][2]};
					connectors.push(point);
				}else if(sub_obj.get('type') == 'text'){
					var text = {
						x: sub_obj.left,
						y : sub_obj.top,
						fontFamily: sub_obj.fontFamily,
						fontSize: sub_obj.fontSize,
						fontWeight: sub_obj.fontWeight,
						text: sub_obj.text
					};
					texts.push(text);
				}else{
					if(sub_obj.get('type') == 'ellipse')
						sub_obj.top = (0 - clone.height);
					paths.push(sub_obj);
				}
			}
			
			var shape = new fabric.PathGroup(paths, {
				left: left, 
				top: top, 
				width: clone.width,
				height: clone.height,
				strokeWidth: 1,
				class: 'shape', 
				transparentCorners: false, 
				perPixelTargetFind: false,
				self: self,
				fill : "white",
				borderColor : "black",
				padding : 7,
			});

			self.canvas.add(shape);
			self.shape = shape;

			/* make connection */
			setConnectors( connectors );
			/* make text */
			initTexts(texts);
			return;
		});
	};
	/*public method*/
	self.getShape								= function(){ return self.shape; };
});

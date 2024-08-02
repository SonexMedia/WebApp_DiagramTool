
var CLASS_TEXT									= function( parent, text, left, top, fontFamily, fontSize, fontWeight, canvas ){
	var self									= this;
	self.class_name 							= 'CLASS_TEXT';
	self.type 									= 'text';
	
	self._canvas								= canvas;
	self._parent								= parent;
	self._left									= left / self._parent.shape.getWidth();
	self._top									= top / self._parent.shape.getHeight();
	self._left1									= left + self._parent.shape.getWidth() / 2;
	self._top1									= top + self._parent.shape.getHeight() / 2;
	self._free_flag								= false;
	self._text									= null;
	
	self._initialize							= function(str){
		MyEvents.apply(this);
		var position = self._calcPosition();
		self._text = new fabric.IText(str, {
			left: position.left,
			top: position.top,
			fontFamily: fontFamily,
			fontSize: fontSize,
			fontWeight: fontWeight,
			fill: 'black',
			hasControls: false,
			hasBorders: true,
			originX: 'center',
			originY: 'center',
			class: 'text',
			self: self
		});
		
		self._canvas.add(self._text);
		
		self.addEventListener("change", function(e) {
			var position = self._calcPosition();
			self._text.setLeft(position.left);
			self._text.setTop(position.top);
			self._text.setAngle(position.angle);
			self._text.setCoords();
		});
		
		self.addEventListener("change1", function(e) {
			var position = self._calcPosition1();
			self._text.setLeft(position.left);
			self._text.setTop(position.top);
			self._text.setAngle(position.angle);
			self._text.setCoords();
		});
		
		self.addEventListener("update", function(e) {
			self._updatePosition();
		});
		
		self.addEventListener("Delete", function(e) {
			self._parent.fireEvent("Delete");
		});

		self.addEventListener("bringFront", function(e)
		{
			self._text.bringToFront();
		});

		self.addEventListener("sendBack", function(e)
		{
			self._text.sendToBack();
		});

		self.addEventListener("Hide", function(e)
		{
			self._text.visible = false;
		});

		self.addEventListener("Show", function(e)
		{
			self._text.visible = true;
		});
		
		self.addEventListener("Selected", function(e) {
			
			if(self._text.fontWeight == 'bold'){
				$("#text-bold").addClass('active');
			}else{
				$("#text-bold").removeClass('active');
			}
			
			if(self._text.fontStyle == 'italic'){
				$("#text-italic").addClass('active');
			}else{
				$("#text-italic").removeClass('active');
			}
			
			if(self._text.textDecoration == 'underline'){
				$("#text-underline").addClass('active');
				$("#text-center").removeClass('active');
			}else if(self._text.textDecoration == 'line-through'){
				$("#text-underline").removeClass('active');
				$("#text-center").addClass('active');
			}else{
				$("#text-underline").removeClass('active');
				$("#text-center").removeClass('active');
			}
			
			var temp = $("#select-fontsize option");
			temp[0].selected = true;
			for(var i = 0; i < temp.length ; i ++){
				if(parseInt(temp[i].value) == self._text.fontSize){
					temp[i].selected = true;
					break;
				}
			}
		});
		
	};
	
	self._calcPosition1							= function(){
		var px, py, angle;
		var shape = self._parent.getShape();
		var oP = shape.getCenterPoint();
		px = oP.x + (self._left1 - shape.getWidth() / 2);
		py = oP.y + (self._top1 - shape.getHeight() / 2);
		angle = shape.getAngle();
		var point = self.rotate_point(px, py, oP.x, oP.y, angle);
		var ret = {left: point.x, top: point.y, angle: angle};
		return ret;
	};
	
	self._calcPosition							= function(){
		var px, py, angle;
		var shape = self._parent.getShape();
		var oP = shape.getCenterPoint();
		px = oP.x + (self._left * shape.getWidth());
		py = oP.y + (self._top * shape.getHeight());
		angle = shape.getAngle();
		var point = self.rotate_point(px, py, oP.x, oP.y, angle);
		var ret = {left: point.x, top: point.y, angle: angle};
		return ret;
	};
	
	self._updatePosition						= function(){
		var px, py, angle;
		var shape = self._parent.getShape();
		var oP = shape.getCenterPoint();
		angle = 0 - shape.getAngle();
		var left = oP.x - (shape.getWidth() / 2);
		var top = oP.y - (shape.getHeight() / 2);
		var right = left + shape.getWidth();
		var bottom = top + shape.getHeight();
		
		var point = self.rotate_point(self._text.getLeft(), self._text.getTop(), oP.x, oP.y, angle);
		
		if( point.x - self._text.getWidth() / 2 < left ){
			point.x = left + self._text.getWidth() / 2;
		}else if(point.x + self._text.getWidth() / 2 > right){
			point.x = right - self._text.getWidth() / 2;
		}
		
		if( point.y - (self._text.getHeight() / 2) < top ){
			point.y = top + self._text.getHeight() / 2;
		}else if( point.y + (self._text.getHeight() / 2) > bottom ){
			point.y = bottom - (self._text.getHeight() / 2);
		}
		
		var tP = self.rotate_point( point.x, point.y, oP.x, oP.y, shape.getAngle() );
		
		self._text.setLeft( tP.x );
		self._text.setTop( tP.y );
		self._left = (point.x - oP.x) / ( shape.getWidth());
		self._top = (point.y - oP.y) / ( shape.getHeight());
		
		self._left1 = (point.x - oP.x) + shape.getWidth() / 2;
		self._top1 = (point.y - oP.y) + shape.getHeight() / 2;
		self._canvas.renderAll();
		
	};
	
	self.rotate_point 							= function(pointX, pointY, originX, originY, angle) {
		angle = angle * Math.PI / 180.0;
		return {
			x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
			y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
		};
	};
	
	self.deleteText								= function(){
		self._canvas.remove( self._text );
	};
	
	{
		self._initialize(text);
	}
}

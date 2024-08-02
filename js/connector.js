var CLASS_CONNECTOR								= function( parent, left, top, canvas ){
	var self									= this;
	self.class_name 							= 'CLASS_CONNECTOR';
	self.type 									= 'connector';
	
	self._parent								= parent;
	self._connect_object						= null;
	self.getConnector							= function(){ return self._connect_object; };
	self._link_line								= new Array();
	self.addLinkLine							= function( obj ){ self._link_line.push(obj) };
	self.canvas									= canvas;
	self.relative_left							= left / self._parent.shape.getWidth();
	self.relative_top							= top / self._parent.shape.getHeight();
	
	self._initialize							= function(){
		MyEvents.apply(this);
		
		self.addEventListener("update", function(e) {
			var pos = self.calcPosition();
			self._connect_object.set({ left: pos.left, top: pos.top });
			self._connect_object.setCoords();
			
			for( var i = 0; i < self._link_line.length; i ++ ){
				if( self._link_line[i].getStartConnector() == self ){
					self._link_line[i].s_point = self._connect_object.getCenterPoint();
				}
				else if( self._link_line[i].getEndConnector() == self ){
					self._link_line[i].e_point = self._connect_object.getCenterPoint();
				}
				self._link_line[i].drawLine();
				self._link_line[i].updateTextPosition();
			}
		});
		self.addEventListener("MouseOver", function(e) {
			self._connect_object.setOpacity(1);
			self._connect_object.setRadius(5);
			self._connect_object.setCoords();
			self.canvas.renderAll();
		});
		self.addEventListener("Hide", function(e) {
			self._connect_object.setOpacity(0);
			self._connect_object.setRadius(0);
			self._connect_object.setCoords();
			self.canvas.renderAll();
		});
		self.addEventListener("Restore", function(e) {
			self._connect_object.setRadius(5);
			self._connect_object.setCoords();
			self.canvas.renderAll();
		});
		self.addEventListener("MouseOut", function(e) {
			self._connect_object.setOpacity(0);
			self._connect_object.setCoords();
			self.canvas.renderAll();
		});
		
		var pos = self.calcPosition();
		var real_point = new fabric.Circle({ 
			left: pos.left,
			top: pos.top,
			radius: 0,
			fill: 'yellow', 
			stroke: 'green',
			opacity: 0,
			strokeWidth: 1,
			originX: 'center',
			originY: 'center',
			selectable: false,
			self: self,
			class: self.class_name
		});
		self.canvas.add(real_point);
		self._connect_object = real_point;
	}
	
	self.rotate_point 							= function(pointX, pointY, originX, originY, angle) {
		angle = angle * Math.PI / 180.0;
		return {
			x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
			y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
		};
	};
	
	self.calcPosition							= function(){
		var pos = {left: 0, top: 0};
		var w = self._parent.shape.getWidth() / self._parent.shape.getScaleX();
		var h = self._parent.shape.getHeight() / self._parent.shape.getScaleY();
		
		pos.left = self._parent.shape.getLeft() +  (self.relative_left * w);
		pos.top = self._parent.shape.getTop() + (self.relative_top * h);
		
		if(self._connect_object != null){
			var px, py, angle;
			var oP = self._parent.shape.getCenterPoint();
			px = oP.x + ((self.relative_left * w) * self._parent.shape.getScaleX()) - self._parent.shape.getWidth() / 2;
			py = oP.y + ((self.relative_top * h) * self._parent.shape.getScaleY()) - self._parent.shape.getHeight() / 2;
			angle = self._parent.shape.getAngle();
			var point = self.rotate_point(px, py, oP.x, oP.y, angle);
			pos.left = point.x;
			pos.top = point.y;
		}
		return pos;
	};
	
	self.removeLinkLine							= function(line){
		for( var i = 0; i < self._link_line.length; i ++ ){
			if( self._link_line[i] == line ){
				self._link_line.splice(i, 1);
				break;
			}
		}
		return;
	};
	
	self.deleteConnector						= function(){
		self.canvas.remove(self._connect_object);
		for( var i = 0; i < self._link_line.length; i ++ ){
			if( self._link_line[i].getStartConnector() == self ){
				self._link_line[i].s_connector = null;
			}
			else if( self._link_line[i].getEndConnector() == self ){
				self._link_line[i].e_connector = null;
			}
		}
	};
	
	self.getCenterPoint							= function(x, y){
		return self._connect_object.getCenterPoint();
	};
	
	{
		self._initialize();
	}
}

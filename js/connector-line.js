var CLASS_CONNECTORLINE							= function( parent, left, top, height, canvas ){
	var self									= this;
	self.class_name 							= 'CLASS_CONNECTORLINE';
	self.type 									= 'connector';
	
	self._parent								= parent;
	self._connect_object						= null;
	self.getConnector							= function(){ return self._connect_object; };
	self._link_line								= new Array();
	self.addLinkLine							= function( obj ){ self._link_line.push(obj) };
	self.canvas									= canvas;
	
	self._initialize							= function(){
		MyEvents.apply(this);
		
		self.addEventListener("update", function(e) {
			var pos = self.calcPosition();
			self._connect_object.set({ left: pos.left, top: pos.top, height: self._parent.con_line.height });
			self._connect_object.setCoords();
			
			for( var i = 0; i < self._link_line.length; i ++ ){
				if( self._link_line[i].getStartConnector() == self ){
					self._link_line[i].s_point = self.getCenterPoint(self._link_line[i].s_point.x, self._link_line[i].s_point.y);
				}
				else if( self._link_line[i].getEndConnector() == self ){
					self._link_line[i].e_point = self.getCenterPoint(self._link_line[i].e_point.x, self._link_line[i].e_point.y);
				}
				self._link_line[i].drawLine();
				self._link_line[i].updateTextPosition();
			}
		});
		self.addEventListener("MouseOver", function(e) {
			self._connect_object.setOpacity(0.2);
			self._connect_object.setWidth(8);
			self._connect_object.setCoords();
			self.canvas.renderAll();
		});
		self.addEventListener("Hide", function(e) {
			self._connect_object.setOpacity(0);
			self._connect_object.setWidth(0);
			self._connect_object.setCoords();
			self.canvas.renderAll();
		});
		self.addEventListener("Restore", function(e) {
			self._connect_object.setWidth(8);
			self._connect_object.setCoords();
			self.canvas.renderAll();
		});
		self.addEventListener("MouseOut", function(e) {
			self._connect_object.setOpacity(0);
			self._connect_object.setCoords();
			self.canvas.renderAll();
		});
		
		var real_point = new fabric.Rect({ 
			left: left,
			top: top,
			width: 0,
			height: height,
			fill: 'green', 
			opacity: 0.2,
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
		return {
			x: pointX,
			y: pointY
		};
	};
	
	self.calcPosition							= function(){
		var pos = {left: 0, top: 0};
		var left = self._parent.shape.left + self._parent.con_line.left;
		var top = self._parent.shape.top + self._parent.con_line.top;
		var height = self._parent.con_line.height;
		
		pos.left = left;
		pos.top = top;
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
		var ry = y;
		if( ry < self._connect_object.getTop() - self._connect_object.getHeight() / 2)
			ry = self._connect_object.getTop() - self._connect_object.getHeight() / 2;
		else if ( ry > self._connect_object.getTop() + self._connect_object.getHeight() / 2 )
			ry = self._connect_object.getTop() + self._connect_object.getHeight() / 2;
			
		return {
			x :self._connect_object.getCenterPoint().x,
			y: ry
		};
	};
	
	{
		self._initialize();
	}
}

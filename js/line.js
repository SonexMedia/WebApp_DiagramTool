
var CLASS_LINE									= function( canvas, option ){
	var self									= this;
	self.class_name 							= 'CLASS_LINE';
	self.type 									= 'line';
	self.canvas									= canvas;
	
	self.line_type								= 'type-0';
	self.line_style								= 'style-0';
	self.line_width								= 1;
	self.lshape_name							= 'none';
	self.rshape_name							= 'none';
	self.s_point								= null;
	self.e_point								= null;
	self.s_connector							= null;
	self.getStartConnector						= function(){ return self.s_connector; };
	self.e_connector							= null;
	self.getEndConnector						= function (){ return self.e_connector; };
	self._line_color							= '#000';
	self._line_object							= null;
	self._left_shape							= null;
	self._right_shape							= null;
	self._texts									= new Array();
	
	self._line_selector							= null;
	self._left_selector							= null;
	self._center_selector						= null;
	self._right_selector						= null;
	self._isCenter								= false;
	self.lastTime								= 0;
	
	self.boundPoints							= new Array();
	self.deltaText								= 0;
	
	self._style_values							= {
		'style-0':[0, 0],
		'style-1':[2, 2],
		'style-2':[5, 5],
		'style-3':[10, 3],
	};
	self._line_shapes							= {
		'none': '',
		'arrow': '',
		'triangle-fill': '',
		'triangle': '',
		'circle-fill':''
	};
	
	MyEvents.apply(this);
	self._initialize							= function(option){
		self.setValues( option );
		self.createLine( );
		self.drawLine();
		
		self.addEventListener("Selected", function(e) {
			var date = new Date();
			var now = date.getTime();
			if(e.target == self._line_object){
				if(now - self.lastTime < 500){
					var text = self.createEmptyText(e.e.layerX, e.e.layerY);
					self._texts.push( text );
					
					var pos = self.setTextPosition( text );
					text.setLeft(pos.x - text.getWidth() / 2);
					text.setTop(pos.y - text.getHeight() / 2);
					text.delta = pos.delta;
					
					self.canvas.add( text ).setActiveObject(text);
//					text.enterEditing();
					
					self.canvas.renderAll();
					return;
				}
				self.lastTime = now;
			}
			self._line_selector.set({ opacity: 0.2 });
			self._left_selector.set({ opacity: 0.5 });
			self._right_selector.set({ opacity: 0.5 });
			if(self._center_selector.display == true)
				self._center_selector.set({ opacity: 0.5 });
			else{
				self._center_selector.set({ opacity: 0 });
				self._center_selector.set({ left: -100, top: -100 });
				self._center_selector.setCoords();
			}
			self.canvas.renderAll();
			
			$("#draw-content-properties").show();
			$("#draw-content-properties #properties-button").show();
			$("#draw-content-properties #properties-controls").hide();
			
			$("#draw-content-properties #button-line").show();
			$("#draw-content-properties #button-shape").hide();
			$("#draw-content-properties #button-text").show();
			var point = self.e_point.x > self.s_point.x ? self.e_point : self.s_point;
			$("#draw-content-properties").css({left: (point.x + 300) + 'px', top: (point.y + 80) + 'px'});
		});
		
		self.addEventListener("MouseUp", function(e) {
			if(e.target == self._left_selector){
				var con = self.checkConnectorsPosition(self._left_selector.getCenterPoint());
				if(con != null && con != self.e_connector && con != self.s_connector ){
					self.s_point = con.getCenterPoint(self._left_selector.getCenterPoint().x, self._left_selector.getCenterPoint().y);
					if( self.s_connector != null )
						self.s_connector.removeLinkLine( self );
					self.s_connector = con;
					self.s_connector.addLinkLine( self );
				}
				else{
					self.s_point = self._left_selector.getCenterPoint();
					if( self.s_connector != null )
						self.s_connector.removeLinkLine( self );
					self.s_connector = null;
				}
				
				self._left_selector.setStroke("#0A0");
				self.drawLine();
			}
			else if(e.target == self._right_selector){
				var con = self.checkConnectorsPosition(self._right_selector.getCenterPoint());
				if(con != null && con != self.e_connector && con != self.s_connector ){
					self.e_point = con.getCenterPoint(self._right_selector.getCenterPoint().x, self._right_selector.getCenterPoint().y);
					if( self.e_connector != null )
						self.e_connector.removeLinkLine( self );
					self.e_connector = con;
					self.e_connector.addLinkLine( self );
				}
				else{
					self.e_point = self._right_selector.getCenterPoint();
					if( self.e_connector != null )
						self.e_connector.removeLinkLine( self );
					self.e_connector = null;
				}
				
				self._right_selector.setStroke("#0A0");
				self.drawLine();
			}
		});
		
		self.addEventListener("Cleared", function(e) {
			self._line_selector.set({opacity: 0});
			self._left_selector.set({opacity: 0});
			self._right_selector.set({opacity: 0});
			self._center_selector.set({ opacity: 0 });
			self.canvas.renderAll();
			
			$("#draw-content-properties").hide();
		});
		
		self.addEventListener("update", function(e) {
			if(e.target == self._line_object){
				self.s_point.x = self._line_object.getLeft();
				self.s_point.y = self._line_object.getTop();
				
				self.e_point.x = self.s_point.x + self._line_object.getWidth();
				self.e_point.y = self.s_point.y + self._line_object.getHeight();
				self._line_selector.set({left: self.s_point.x - 3, top: self.s_point.y - 3});
				self._line_selector.setCoords();
				self._left_selector.set({left: self.s_point.x, top: self.s_point.y });
				self._left_selector.setCoords();
				self._right_selector.set({left: self.e_point.x, top: self.e_point.y });
				self._right_selector.setCoords();
				var r = 5;
				
				if( self.s_connector != null ){
					var p = self.s_connector.getConnector().getCenterPoint();
					if (self.s_point.x < p.x - r || self.s_point.x > p.x + r || self.s_point.y < p.y - r || self.s_point.y > p.y + r){
						self.s_connector.removeLinkLine( self );
						self.s_connector = null;
					}
				}
				if( self.e_connector != null ){
					var p = self.e_connector.getConnector().getCenterPoint();
					if (self.e_point.x < p.x - r || self.e_point.x > p.x + r || self.e_point.y < p.y - r || self.e_point.y > p.y + r){
						self.e_connector.removeLinkLine( self );
						self.e_connector = null;
					}
				}
				
				self.drawLine();
				self.updateTextPosition();
				
			}else if(e.target == self._left_selector){
				var con = self.checkConnectorsPosition(self._left_selector.getCenterPoint());
				if(con != null && con != self.e_connector){
					self.s_point = con.getCenterPoint(self._left_selector.getCenterPoint().x, self._left_selector.getCenterPoint().y);
					self._left_selector.setStroke("#A00");
				}
				else{
					self.s_point = self._left_selector.getCenterPoint();
					self._left_selector.setStroke("#0A0");
				}
				self.drawLine();
				self.updateTextPosition();
			}else if(e.target == self._right_selector){
				var con = self.checkConnectorsPosition(self._right_selector.getCenterPoint());
				if( con != null && con != self.s_connector ){
					self.e_point = con.getCenterPoint(self._right_selector.getCenterPoint().x, self._right_selector.getCenterPoint().y);
					self._right_selector.setStroke("#A00");
				}
				else{
					self.e_point = self._right_selector.getCenterPoint();
					self._right_selector.setStroke("#0A0");
				}
				self.drawLine();
				self.updateTextPosition();
			}else if(e.target == self._center_selector){
				if( self._center_selector.arrow == 'x' ){
					self._center_selector.set({top: self._center_selector.oy});
				}else{
					self._center_selector.set({left: self._center_selector.ox});
				}
				self._center_selector.setCoords();
				self._isCenter = true;
				self.drawLine();
				self._isCenter = false;
				
				self.updateTextPosition();
			}else{
				var pos = self.setTextPosition( e.target );
				e.target.setLeft(pos.x - e.target.getWidth() / 2);
				e.target.setTop(pos.y - e.target.getHeight() / 2);
				e.target.delta = pos.delta;
				
				self.canvas.renderAll();
			}
			var point = self.e_point.x > self.s_point.x ? self.e_point : self.s_point;
			$("#draw-content-properties").css({left: (point.x + 300) + 'px', top: (point.y + 80) + 'px'});
		});
		
		self.addEventListener("Delete", function(e) {
			for( var i = 0; i < self._texts.length; i ++){
				self.canvas.remove(self._texts[i]);
			}
			self._texts = new Array();
			self.canvas.remove( self._line_object );
			self.canvas.remove( self._left_shape );
			self.canvas.remove( self._right_shape );
			self.canvas.remove( self._line_selector );
			self.canvas.remove( self._left_selector );
			self.canvas.remove( self._center_selector );
			self.canvas.remove( self._right_selector );
			self.canvas.renderAll();
			
			if( self.s_connector != null )
				self.s_connector.removeLinkLine( self );
			else if( self.e_connector != null )
				self.e_connector.removeLinkLine( self );
				
			self.s_connector = null;
			self.e_connector = null;
		});
	};
	
	self.setValues								= function( option ){
		if( typeof option.line_type != 'undefined' )
			self.line_type = option.line_type;
		if( typeof option.line_style != 'undefined' )
			self.line_style = option.line_style;
		if( typeof option.line_width != 'undefined' )
			self.line_width = option.line_width;
		if( typeof option.s_point != 'undefined' )
			self.s_point = option.s_point;
		if( typeof option.e_point != 'undefined' )
			self.e_point = option.e_point;
		if( typeof option.s_connector != 'undefined' ){
			self.s_connector = option.s_connector;
			if( self.s_connector != null ){
				self.s_connector.addLinkLine(self);
				self.s_point = self.s_connector.getCenterPoint(self.s_point.x, self.s_point.y);
			}
		}
		if( typeof option.e_connector != 'undefined' ){
			self.e_connector = option.e_connector;
			if( self.e_connector != null ){
				self.e_connector.addLinkLine(self);
				self.e_point = self.e_connector.getCenterPoint(self.e_point.x, self.e_point.y);
			}
		}
		if( typeof option.lshape_name != 'undefined' )
			self.lshape_name = option.lshape_name;
		if( typeof option.rshape_name != 'undefined' )
			self.rshape_name = option.rshape_name;
		return;
	};
	
	self.createLine								= function(){
		var start = self.s_point;
		var end = self.e_point;
		if( start == null || end == null)
			return;
		
		self._line_object = new fabric.Path('M 0 0', {});
		self._line_object.set({
			left: 0,
			top: 0,
			fill: '',
			stroke: self._line_color,
			strokeWidth: self.line_width,
			strokeDashArray: self._style_values[self.line_style],
			perPixelTargetFind: true,
			hasControls: false,
			hasBorders: false, 
			padding: 10,
			class: 'line',
			self: self,
		});
		
		self._line_selector = new fabric.Path('M 0 0', {});
		self._line_selector.set({
			left: 0,
			top: 0,
			fill: '',
			stroke: '#0A0',
			strokeWidth: self.line_width + 6,
			strokeDashArray: self._style_values[self.line_style],
			perPixelTargetFind: true,
			hasControls: false,
			hasBorders: false, 
			class: 'line',
			self: self,
			opacity: 0,
		});
		
		self._left_selector = new fabric.Circle({
			left: self.s_point.x,
			top: self.s_point.y,
			radius: 5,
			fill: '#999',
			stroke: '#0A0',
			strokeWidth: 3,
			originX: 'center',
			originY: 'center',
			perPixelTargetFind: true,
			hasBorders: false, 
			hasControls: false,
			opacity: 0,
			class: 'line',
			self: self,
		});
		
		self._right_selector = new fabric.Circle({
			left: self.e_point.x,
			top: self.e_point.y,
			radius: 5,
			fill: '#999',
			stroke: '#0A0',
			strokeWidth: 3,
			originX: 'center',
			originY: 'center',
			perPixelTargetFind: true,
			hasBorders: false, 
			hasControls: false,
			opacity: 0,
			class: 'line',
			self: self,
		});
		
		self._center_selector = new fabric.Circle({
			left: self.s_point.x,
			top: self.s_point.y,
			radius: 5,
			fill: '#999',
			stroke: '#0A0',
			strokeWidth: 3,
			originX: 'center',
			originY: 'center',
			perPixelTargetFind: true,
			hasBorders: false, 
			hasControls: false,
			opacity: 0,
			class: 'line',
			self: self,
			ox: self.s_point.x,
			oy: self.s_point.y,
		});
		
		self._left_shape = new fabric.Path("M 0 0", {
			left: self.s_point.x,
			top: self.s_point.y,
			stroke: self._line_color,
			strokeWidth: 1,
			class: 'line',
			self: self,
			perPixelTargetFind: true,
			hasBorders: false, 
			hasControls: false,
		});
		
		self._right_shape = new fabric.Path("M 0 0", {
			left: self.s_point.x,
			top: self.s_point.y,
			stroke: self._line_color,
			strokeWidth: 1,
			class: 'line',
			self: self,
			perPixelTargetFind: true,
			hasBorders: false, 
			hasControls: false,
		});
		
		self.canvas.add(self._line_object);
		self.canvas.add(self._left_shape);
		self.canvas.add(self._right_shape);
		
		self.canvas.add(self._line_selector);
		self.canvas.add(self._left_selector);
		self.canvas.add(self._right_selector);
		self.canvas.add(self._center_selector);
		self._line_object.perPixelTargetFind = true;
		self.canvas.renderAll();
		return self._line_object;
	};
	
	self.drawLine								= function(){
		var start = self.s_point;
		var end = self.e_point;
		if( start == null || end == null)
			return;
			
		self._left_selector.set({left: start.x, top: start.y});
		self._left_selector.setCoords();
		self._right_selector.set({left: end.x, top: end.y});
		self._right_selector.setCoords();
		self._center_selector.set({
			display: false,
		});
		
		self._line_object.set({
			strokeWidth: self.line_width,
			strokeDashArray: self._style_values[self.line_style]
		});
		self.setLeftPointShape( );
		self.setRightPointShape( );
//		self.adjustPositionforText();
		
		switch(self.line_type){
		case 'type-0':
			self._drawLineType0(start, end);
			break;
		case 'type-1':
			self._drawLineType1(start, end);
			break;
		case 'type-2':
			self._drawLineType2(start, end);
			break;
		case 'type-3':
			self._drawLineType3(start, end);
			break;
		}
		
		self.canvas.renderAll();
	};
	
	self._drawLineType0							= function(start, end){
		var path = new Array();
		var x = end.x - start.x, y = end.y - start.y;
		
		path[0] = ["M", 0, 0];
		path[1] = ["L", x, y];
		
		var w = x, h = y;
		var angleDeg = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
		
		self._line_object.set({
			left: start.x, 
			top: start.y, 
			width: w, 
			height: h, 
			path: path
		});
		self._line_selector.set({
			left: start.x - 3, 
			top: start.y - 3, 
			strokeLineCap: 'round',
			path: path,
		});
		
		var deltal = 5 + (Math.abs(angleDeg) % 181) / 180;
		var lpos = fabric.util.rotatePoint(
			new fabric.Point(start.x - 2, start.y - deltal),
			new fabric.Point(start.x, start.y),
			fabric.util.degreesToRadians(angleDeg)
		);
		
		var deltar = 6 - (Math.abs(angleDeg) % 181) / 180;
		var rpos = fabric.util.rotatePoint(
			new fabric.Point(end.x - 2, end.y - deltar),
			new fabric.Point(end.x, end.y),
			fabric.util.degreesToRadians(angleDeg + 180)
		);		
		self._left_shape.set({left: lpos.x, top: lpos.y, angle: angleDeg});
		self._right_shape.set({left: rpos.x, top: rpos.y, angle: angleDeg + 180});
		self._line_selector.setCoords();
		self._line_object.setCoords();
		
		{
			self.boundPoints = new Array();
			self.boundPoints.push(start);
			self.boundPoints.push(end);
			
		}
		return angleDeg;
	};
	
	self._drawLineType1								= function(start, end){
		var ret;
		var start_arrow = 'x', end_arrow = 'y';
		var x = end.x - start.x, y = end.y - start.y;
		
		if( self.s_connector != null && Math.abs(self.s_connector.relative_left - 0.5) < Math.abs(self.s_connector.relative_top - 0.5) ){
			start_arrow = 'y';
		}
		
		if( self.e_connector != null && Math.abs(self.e_connector.relative_left - 0.5) >= Math.abs(self.e_connector.relative_top - 0.5) ){
			end_arrow = 'x';
		}
		
		if( self.e_connector == null )
			end_arrow = start_arrow;
			
		if( start_arrow != end_arrow )
			ret = self._senario_otherArrowforType1( start_arrow, start, end );
		else
			ret = self._senario_sameArrowforType1( start_arrow, start, end );
			
		var w = x, h = y;
		self._line_object.set({
			left: start.x, 
			top: start.y, 
			width: ret.width, 
			height: ret.height, 
			path: ret.path
		});
		self._line_selector.set({
			left: start.x - 3, 
			top: start.y - 3, 
			strokeLineCap: 'round',
			path: ret.path
		});
		self._line_selector.setCoords();
		self._line_object.setCoords();
	};
	
	self._senario_otherArrowforType1						= function( start_arrow, start, end ){
		var path = new Array();
		var tx, ty, x, y;
		x = end.x - start.x;
		y = end.y - start.y;
		var langleDeg = 0, rangleDeg = 0;
		if(start_arrow == 'x'){
			tx = x;
			ty = 0;
			
			if( start.x < end.x )
				langleDeg = 0;
			else
				langleDeg = -180;
				
			if( start.y < end.y )
				rangleDeg = -90;
			else
				rangleDeg = 90;
		}else{
			tx = 0;
			ty = y;
			
			if( start.x < end.x )
				rangleDeg = -180;
			else
				rangleDeg = 0;
				
			if( start.y < end.y )
				langleDeg = 90;
			else
				langleDeg = -90;
		}
		var deltal = 5 + (Math.abs(langleDeg) % 181) / 180;
		var lpos = fabric.util.rotatePoint(
			new fabric.Point(start.x, start.y - deltal),
			new fabric.Point(start.x, start.y),
			fabric.util.degreesToRadians(langleDeg)
		);
		
		var deltar = 6 - (Math.abs(rangleDeg - 180) % 181) / 180;
		var rpos = fabric.util.rotatePoint(
			new fabric.Point(end.x, end.y - deltar),
			new fabric.Point(end.x, end.y),
			fabric.util.degreesToRadians(rangleDeg)
		);		
		self._left_shape.set({left: lpos.x, top: lpos.y, angle: langleDeg});
		self._right_shape.set({left: rpos.x, top: rpos.y, angle: rangleDeg});
		
		path[0] = ["M", 0, 0];
		path[1] = ["L", tx, ty];
		path[2] = ["L", x, y];
		
		{
			var pos0 = start;
			var pos1 = { x: start.x + tx, y: start.y + ty};
			var pos2 = end;
			self.boundPoints = new Array();
			self.boundPoints.push(pos0);
			self.boundPoints.push(pos1);
			self.boundPoints.push(pos1);
			self.boundPoints.push(pos2);
		}
		
		return { path: path, width: x, height: y };
	};
	
	self._senario_sameArrowforType1						= function( start_arrow, start, end ){
		var path = new Array();
		var tx1, ty1, tx2, ty2, x, y, w, h;
		var langleDeg = 0, rangleDeg = 0;
		
		x = end.x - start.x;
		y = end.y - start.y;
		w = x;
		h = y;
		var start1 = {
			x: start.x,
			y: start.y
		};
		
		if(start_arrow == 'x'){
			tx1 = x / 2;
			ty1 = 0;
			tx2 = x / 2;
			ty2 = y;
			
			
			if( self._isCenter == true){
				tx1 = self._center_selector.left - start.x;
				ty1 = 0;
				tx2 = self._center_selector.left - start.x;
				ty2 = y;
				
				if(Math.abs(tx1) > Math.abs(x))
					w = (Math.abs(self._center_selector.left - start.x) > Math.abs(self._center_selector.left - end.x)) ? self._center_selector.left - start.x : self._center_selector.left - end.x;
				
				start1.x = self._center_selector.left;
				start1.y = self._center_selector.top;
				
			}
			
			if( start1.x < end.x ){
				langleDeg = 0;
				rangleDeg = 180;
			}
			else{
				langleDeg = -180;
				rangleDeg = 0;
			}
			
		}else{
			tx1 = 0;
			ty1 = y / 2;
			tx2 = x;
			ty2 = y / 2;
			if( self._isCenter == true){
				tx1 = 0;
				ty1 = self._center_selector.top - start.y;
				tx2 = x;
				ty2 = self._center_selector.top - start.y;
				if(Math.abs(ty1) > Math.abs(y))
					h = (Math.abs(self._center_selector.top - start.y) > Math.abs(self._center_selector.top - end.y)) ? self._center_selector.top - start.y : self._center_selector.top - end.y;
					
				start1.x = self._center_selector.left;
				start1.y = self._center_selector.top;
			}
			
			if( start1.y < end.y ){
				langleDeg = 90;
				rangleDeg = -90;
			}
			else{
				langleDeg = -90;
				rangleDeg = 90;
			}
		}
		
		path[0] = ["M", 0, 0];
		path[1] = ["L", tx1, ty1];
		path[2] = ["L", tx2, ty2];
		path[3] = ["L", x, y];
		
		{
			var pos0 = start;
			var pos1 = { x: start.x + tx1, y: start.y + ty1};
			var pos2 = { x: start.x + tx2, y: start.y + ty2};
			var pos3 = end;
			self.boundPoints = new Array();
			self.boundPoints.push(pos0);
			self.boundPoints.push(pos1);
			self.boundPoints.push(pos1);
			self.boundPoints.push(pos2);
			self.boundPoints.push(pos2);
			self.boundPoints.push(pos3);
		}
		
		if( self._isCenter == false){
			self._center_selector.set({
				left: start.x + x / 2, 
				top: start.y + y / 2, 
				ox: start.x + x / 2, 
				oy: start.y + y / 2, 
				arrow: start_arrow,
				display: true,
			});
		}
		
		var deltal = 5 + (Math.abs(langleDeg) % 181) / 180;
		var lpos = fabric.util.rotatePoint(
			new fabric.Point(start.x - 2, start.y - deltal),
			new fabric.Point(start.x, start.y),
			fabric.util.degreesToRadians(langleDeg)
		);
		
		var deltar = 5.5 - ((Math.abs(rangleDeg - 180) % 181) / 180) * 0.5;
		var rpos = fabric.util.rotatePoint(
			new fabric.Point(end.x - 2, end.y - deltar),
			new fabric.Point(end.x, end.y),
			fabric.util.degreesToRadians(rangleDeg)
		);		
		
		self._left_shape.set({left: lpos.x, top: lpos.y, angle: langleDeg});
		self._right_shape.set({left: rpos.x, top: rpos.y, angle: rangleDeg});
		self._center_selector.setCoords();
		
		return { path: path, width: w, height: h };
	};
	
	self._drawLineType2								= function(start, end){
		var ret;
		var start_arrow = 'x', end_arrow = 'y';
		var x = end.x - start.x, y = end.y - start.y;
		
		if( self.s_connector != null && Math.abs(self.s_connector.relative_left - 0.5) < Math.abs(self.s_connector.relative_top - 0.5) )
			start_arrow = 'y';
		if( self.e_connector != null && Math.abs(self.e_connector.relative_left - 0.5) >= Math.abs(self.e_connector.relative_top - 0.5) )
			end_arrow = 'x';
		
		if( self.e_connector == null )
			end_arrow = (start_arrow == 'x' ? 'y' : 'x');
			
		if( start_arrow != end_arrow )
			ret = self._senario_otherArrowforType2( start_arrow, start, end );
		else
			ret = self._senario_sameArrowforType2( start_arrow, start, end );
		var w = x, h = y;
		self._line_object.set({
			left: start.x, 
			top: start.y, 
			width: ret.width, 
			height: ret.height, 
			path: ret.path
		});
		
		self._line_selector.set({
			left: start.x - 3, 
			top: start.y - 3, 
			strokeLineCap: 'round',
			path: ret.path
		});
		self._line_selector.setCoords();
		self._line_object.setCoords();
	};
	
	self._senario_otherArrowforType2						= function( start_arrow, start, end ){
		var path = new Array();
		var x, y, sign_x = 1, sign_y = 1;
		var tx = new Array();
		var ty = new Array();
		var langleDeg = 0, rangleDeg = 0;
		
		var tx1, ty1;
		
		x = end.x - start.x;
		y = end.y - start.y;
		if( x < 0 )
			sign_x = -1;
		if( y < 0 )
			sign_y = -1;
			
		if(start_arrow == 'x'){
			tx1 = x;
			ty1 = 0;
			
			tx[0] = x - (10 * sign_x);
			ty[0] = 0;
			tx[1] = x;
			ty[1] = 0;
			tx[2] = x;
			ty[2] = 0 + (10 * sign_y);
			
			if( start.x < end.x )
				langleDeg = 0;
			else
				langleDeg = -180;
				
			if( start.y < end.y )
				rangleDeg = -90;
			else
				rangleDeg = 90;
		}else{
			tx1 = 0;
			ty1 = y;
			
			tx[0] = 0;
			ty[0] = y - (10 * sign_y);
			tx[1] = 0;
			ty[1] = y;
			tx[2] = 0 + (10 * sign_x);
			ty[2] = y;
			if( start.x < end.x )
				rangleDeg = -180;
			else
				rangleDeg = 0;
				
			if( start.y < end.y )
				langleDeg = 90;
			else
				langleDeg = -90;
		}
		
		path[0] = ["M", 0, 0];
		path[1] = ["L", tx[0], ty[0]];
		path[2] = ["C", tx[0], ty[0], tx[1], ty[1], tx[2], ty[2]];
		path[3] = ["L", x, y];
		
		{
			var pos0 = start;
			var pos1 = { x: start.x + tx1, y: start.y + ty1};
			var pos2 = end;
			self.boundPoints = new Array();
			self.boundPoints.push(pos0);
			self.boundPoints.push(pos1);
			self.boundPoints.push(pos1);
			self.boundPoints.push(pos2);
		}
		
		var lpos = fabric.util.rotatePoint(
			new fabric.Point(start.x, start.y - 5),
			new fabric.Point(start.x, start.y),
			fabric.util.degreesToRadians(langleDeg)
		);		
		var rpos = fabric.util.rotatePoint(
			new fabric.Point(end.x, end.y - 5),
			new fabric.Point(end.x, end.y),
			fabric.util.degreesToRadians(rangleDeg)
		);		
		
		self._left_shape.set({left: lpos.x, top: lpos.y, angle: langleDeg});
		self._right_shape.set({left: rpos.x, top: rpos.y, angle: rangleDeg});
		
		return { path: path, width: x, height: y };
	};
	
	self._senario_sameArrowforType2							= function( start_arrow, start, end ){
		var path = new Array();
		var x, y, sign_x = 1, sign_y = 1, w, h;
		var tx = new Array();
		var ty = new Array();
		var langleDeg = 0, rangleDeg = 0;
		var tx1, tx2, ty1, ty2;
		
		x = end.x - start.x;
		y = end.y - start.y;
		w = x;
		h = y;
		
		if( x < 0 )
			sign_x = -1;
		if( y < 0 )
			sign_y = -1;
			
		if(start_arrow == 'x'){
			tx[0] = x / 2 - (10 * sign_x);
			ty[0] = 0;
			tx[1] = x / 2;
			ty[1] = 0;
			tx[2] = x / 2;
			ty[2] = 0 + (10 * sign_y);
			tx[3] = x / 2;
			ty[3] = y - (10 * sign_y);
			tx[4] = x / 2;
			ty[4] = y;
			tx[5] = x / 2 + (10 * sign_x);
			ty[5] = y;
			
			tx1 = x / 2;
			ty1 = 0;
			tx2 = x / 2;
			ty2 = y;
			
			if( self._isCenter == true){
				tx1 = self._center_selector.left - start.x;
				ty1 = 0;
				tx2 = self._center_selector.left - start.x;
				ty2 = y;
				
				tx[0] = (self._center_selector.left - start.x) - (10 * sign_x);
				ty[0] = 0;
				tx[1] = (self._center_selector.left - start.x);
				ty[1] = 0;
				tx[2] = (self._center_selector.left - start.x);
				ty[2] = 0 + (10 * sign_y);
				tx[3] = (self._center_selector.left - start.x);
				ty[3] = y - (10 * sign_y);
				tx[4] = (self._center_selector.left - start.x);
				ty[4] = y;
				tx[5] = (self._center_selector.left - start.x) + (10 * sign_x);
				ty[5] = y;
				if(Math.abs(tx[1]) > Math.abs(x)){
					if(tx[1] >= 0)
						sign_x = 1;
					else 
						sign_x = -1;
					tx[0] = (self._center_selector.left - start.x) - (10 * sign_x);
					tx[5] = (self._center_selector.left - start.x) - (10 * sign_x);
					
					w = (Math.abs(self._center_selector.left - start.x) > Math.abs(self._center_selector.left - end.x)) ? self._center_selector.left - start.x : self._center_selector.left - end.x;
				}
				
			}
			if( start.x < end.x ){
				langleDeg = 0;
				rangleDeg = -180;
			}
			else{
				langleDeg = -180;
				rangleDeg = 0;
			}
			
		}else{
			tx[0] = 0;
			ty[0] = y / 2 - (10 * sign_y);
			tx[1] = 0;
			ty[1] = y / 2;
			tx[2] = 0 + (10 * sign_x);
			ty[2] = y / 2;
			tx[3] = x - (10 * sign_x);
			ty[3] = y / 2;
			tx[4] = x;
			ty[4] = y / 2;
			tx[5] = x;
			ty[5] = y / 2 + (10 * sign_y);
			tx1 = 0;
			ty1 = y / 2;
			tx2 = x;
			ty2 = y / 2;
			
			if( self._isCenter == true){
				tx[0] = 0;
				ty[0] = (self._center_selector.top - start.y) - (10 * sign_y);
				tx[1] = 0;
				ty[1] = (self._center_selector.top - start.y);
				tx[2] = 0 + (10 * sign_x);
				ty[2] = (self._center_selector.top - start.y);
				tx[3] = x - (10 * sign_x);
				ty[3] = (self._center_selector.top - start.y);
				tx[4] = x;
				ty[4] = (self._center_selector.top - start.y);
				tx[5] = x;
				ty[5] = (self._center_selector.top - start.y) + (10 * sign_y);
				
				tx1 = 0;
				ty1 = self._center_selector.top - start.y;
				tx2 = x;
				ty2 = self._center_selector.top - start.y;
				
				if(Math.abs(ty[1]) > Math.abs(y)){
					if(ty[1] >= 0)
						sign_y = 1;
					else
						sign_y = -1;
					ty[0] = (self._center_selector.top - start.y) - (10 * sign_y);
					ty[5] = (self._center_selector.top - start.y) - (10 * sign_y);
					h = (Math.abs(self._center_selector.top - start.y) > Math.abs(self._center_selector.top - end.y)) ? self._center_selector.top - start.y : self._center_selector.top - end.y;
				}
			}
			if( start.y < end.y ){
				langleDeg = 90;
				rangleDeg = -90;
			}
			else{
				langleDeg = -90;
				rangleDeg = 90;
			}
		}
		
		path[0] = ["M", 0, 0];
		path[1] = ["L", tx[0], ty[0]];
		path[2] = ["C", tx[0], ty[0], tx[1], ty[1], tx[2], ty[2]];
		path[3] = ["L", tx[3], ty[3]];
		path[4] = ["C", tx[3], ty[3], tx[4], ty[4], tx[5], ty[5]];
		path[5] = ["L", x, y];
		
		{
			var pos0 = start;
			var pos1 = { x: start.x + tx1, y: start.y + ty1};
			var pos2 = { x: start.x + tx2, y: start.y + ty2};
			var pos3 = end;
			self.boundPoints = new Array();
			self.boundPoints.push(pos0);
			self.boundPoints.push(pos1);
			self.boundPoints.push(pos1);
			self.boundPoints.push(pos2);
			self.boundPoints.push(pos2);
			self.boundPoints.push(pos3);
		}
		
		if( self._isCenter == false){
			self._center_selector.set({
				left: start.x + x / 2, 
				top: start.y + y / 2, 
				ox: start.x + x / 2, 
				oy: start.y + y / 2, 
				arrow: start_arrow,
				display: true,
			});
		}
		
		var lpos = fabric.util.rotatePoint(
			new fabric.Point(start.x, start.y - 5),
			new fabric.Point(start.x, start.y),
			fabric.util.degreesToRadians(langleDeg)
		);		
		var rpos = fabric.util.rotatePoint(
			new fabric.Point(end.x, end.y - 5),
			new fabric.Point(end.x, end.y),
			fabric.util.degreesToRadians(rangleDeg)
		);		
		
		self._left_shape.set({left: lpos.x, top: lpos.y, angle: langleDeg});
		self._right_shape.set({left: rpos.x, top: rpos.y, angle: rangleDeg});
		
		self._center_selector.setCoords();
		return { path: path, width: w, height: h };
	};
	
	self._drawLineType3								= function(start, end){
		var ret;
		var start_arrow = 'x', end_arrow = 'y';
		var x = end.x - start.x, y = end.y - start.y;
		
		if( self.s_connector != null && Math.abs(self.s_connector.relative_left - 0.5) < Math.abs(self.s_connector.relative_top - 0.5) )
			start_arrow = 'y';
		if( self.e_connector != null && Math.abs(self.e_connector.relative_left - 0.5) >= Math.abs(self.e_connector.relative_top - 0.5) )
			end_arrow = 'x';
		
		if( self.e_connector == null )
			end_arrow = (start_arrow == 'x' ? 'y' : 'x');
			
		if( start_arrow != end_arrow )
			ret = self._senario_otherArrowforType3( start_arrow, start, end );
		else
			ret = self._senario_sameArrowforType3( start_arrow, start, end );
		var w = x, h = y;
		self._line_object.set({
			left: start.x, 
			top: start.y, 
			width: ret.width, 
			height: ret.height, 
			path: ret.path
		});
		self._line_selector.set({
			left: start.x - 3, 
			top: start.y - 3, 
			strokeLineCap: 'round',
			path: ret.path
		});
		self._line_selector.setCoords();
		self._line_object.setCoords();
	};
	
	self._senario_otherArrowforType3						= function( start_arrow, start, end ){
		var path = new Array();
		var x, y, sign_x = 1, sign_y = 1;
		var tx, ty;
		x = end.x - start.x;
		y = end.y - start.y;
		
		if(start_arrow == 'x'){
			tx = x;
			ty = 0;
		}else{
			tx = 0;
			ty = y;
		}
		
		path[0] = ["M", 0, 0];
		path[1] = ["C", 0, 0, tx, ty, x, y];
		return { path: path, width: x, height: y };
	};
	self._senario_sameArrowforType3							= function( start_arrow, start, end ){
		var path = new Array();
		var x, y, w, h;
		var tx = new Array();
		var ty = new Array();
		
		x = end.x - start.x;
		y = end.y - start.y;
		w = x;
		h = y;
		if(start_arrow == 'x'){
			tx[0] = x / 2;
			ty[0] = 0;
			tx[1] = x / 2;
			ty[1] = y / 2;
			tx[2] = x / 2;
			ty[2] = y;
			if( self._isCenter == true ){
				tx[0] = self._center_selector.left - start.x;
				ty[0] = 0;
				tx[1] = self._center_selector.left - start.x;
				ty[1] = y / 2;
				tx[2] = self._center_selector.left - start.x;
				ty[2] = y;
				
				if( Math.abs(tx[1]) > Math.abs(w) )
					w = (Math.abs(self._center_selector.left - start.x) > Math.abs(self._center_selector.left - end.x)) ? self._center_selector.left - start.x : self._center_selector.left - end.x;
				
			}
		}else{
			tx[0] = 0;
			ty[0] = y / 2;
			tx[1] = x / 2;
			ty[1] = y / 2;
			tx[2] = x;
			ty[2] = y / 2;
			if( self._isCenter == true ){
				tx[0] = 0;
				ty[0] = self._center_selector.top - start.y;
				tx[1] = x / 2;
				ty[1] = self._center_selector.top - start.y;
				tx[2] = x;
				ty[2] = self._center_selector.top - start.y;
				if( Math.abs(ty[1]) > Math.abs(h) )
					h = (Math.abs(self._center_selector.top - start.y) > Math.abs(self._center_selector.top - end.y)) ? self._center_selector.top - start.y : self._center_selector.top - end.y;
			}
		}
		
		path[0] = ["M", 0, 0];
		path[1] = ["C", 0, 0, tx[0], ty[0], tx[1], ty[1]];
		path[2] = ["C", tx[1], ty[1], tx[2], ty[2], x, y];
		
		if( self._isCenter == false){
			self._center_selector.set({
				left: start.x + tx[1], 
				top: start.y + ty[1], 
				ox: start.x + tx[1], 
				oy: start.y + ty[1], 
				arrow: start_arrow,
				display: true,
			});
		}
		self._center_selector.setCoords();
		return { path: path, width: w, height: h };
	};
	
	self.checkConnectorsPosition 							= function(point){
		for(var i = 0; i < T_Connectors.length; i ++){
			var p = T_Connectors[i].getConnector().getCenterPoint();
			var r = T_Connectors[i].getConnector().radius;
			
			var w = T_Connectors[i].getConnector().getWidth();
			var h = T_Connectors[i].getConnector().getHeight() / 2;
			if(T_Connectors[i].class_name == "CLASS_CONNECTOR"){
				if(point.x >= p.x - r && point.x <= p.x + r && point.y >= p.y - r && point.y <= p.y + r){
					return T_Connectors[i];
				}
			}
			else{
				if(point.x >= p.x - w && point.x <= p.x + w && point.y >= p.y - h && point.y <= p.y + h){
					return T_Connectors[i];
				}
			}
		}
		return null;
	};
	
	self.setLeftPointShape									= function(){
		var path = new Array();
		switch(self.lshape_name){
		case 'none':
//			self._left_selector
			path[0] = ["M", 0, 0];
			break;
		case 'arrow':
			path[0] = ["M", 10, 0];
			path[1] = ["L", 0, 5];
			path[2] = ["L", 10, 9];
			self._left_shape.set({
				left: self.s_point.x,
				top: self.s_point.y - 5,
				fill: '',
				stroke: self._line_color,
				strokeWidth: 1,
			});
			break;
		case 'triangle-fill':
			path[0] = ["M", 10, 0];
			path[1] = ["L", 0, 5];
			path[2] = ["L", 10, 9];
			path[3] = ["Z"];
			self._left_shape.set({
				left: self.s_point.x,
				top: self.s_point.y - 5,
				fill: self._line_color,
				stroke: self._line_color,
				strokeWidth: 1,
			});
			break;
		case 'triangle':
			path[0] = ["M", 10, 0];
			path[1] = ["L", 0, 5];
			path[2] = ["L", 10, 9];
			path[3] = ["Z"];
			self._left_shape.set({
				left: self.s_point.x,
				top: self.s_point.y - 5,
				fill: '',
				stroke: self._line_color,
				strokeWidth: 1,
			});
			break;
		case 'circle-fill':
			path[0] = ["M", 0, 5];
			path[1] = ["C", 0, 5, 0, 0, 5, 0];
			path[2] = ["C", 5, 0, 10, 0, 10, 5];
			path[3] = ["C", 10, 5, 10, 10, 5, 10];
			path[4] = ["C", 5, 10, 0, 10, 0, 5];
			path[5] = ["Z"];
			self._left_shape.set({
				left: self.s_point.x,
				top: self.s_point.y - 5,
				fill: self._line_color,
				stroke: self._line_color,
				strokeWidth: 1,
			});
			break;
		}
		
		self._left_shape.set({path: path});
		self.canvas.renderAll();
	};
	
	self.setRightPointShape									= function(){
		var path = new Array();
		switch(self.rshape_name){
		case 'none':
//			self._left_selector
			path[0] = ["M", 0, 0];
			break;
		case 'arrow':
			path[0] = ["M", 10, 0];
			path[1] = ["L", 0, 5];
			path[2] = ["L", 10, 9];
			self._right_shape.set({
				left: self.e_point.x - 10,
				top: self.e_point.y - 5,
				fill: '',
				stroke: self._line_color,
				strokeWidth: 1,
			});
			break;
		case 'triangle-fill':
			path[0] = ["M", 10, 0];
			path[1] = ["L", 0, 5];
			path[2] = ["L", 10, 9];
			path[3] = ["Z"];
			self._right_shape.set({
				left: self.e_point.x - 10,
				top: self.e_point.y - 5,
				fill: self._line_color,
				stroke: self._line_color,
				strokeWidth: 1,
			});
			break;
		case 'triangle':
			path[0] = ["M", 10, 0];
			path[1] = ["L", 0, 5];
			path[2] = ["L", 10, 9];
			path[3] = ["Z"];
			self._right_shape.set({
				left: self.e_point.x - 10,
				top: self.e_point.y - 5,
				fill: '',
				stroke: self._line_color,
				strokeWidth: 1,
			});
			break;
		case 'circle-fill':
			path[0] = ["M", 0, 5];
			path[1] = ["C", 0, 5, 0, 0, 5, 0];
			path[2] = ["C", 5, 0, 10, 0, 10, 5];
			path[3] = ["C", 10, 5, 10, 10, 5, 10];
			path[4] = ["C", 5, 10, 0, 10, 0, 5];
			path[5] = ["Z"];
			self._right_shape.set({
				left: self.e_point.x - 10,
				top: self.e_point.y - 5,
				fill: self._line_color,
				stroke: self._line_color,
				strokeWidth: 1,
			});
			break;
		}
		
		self._right_shape.set({path: path});
		self.canvas.renderAll();
	};
	
	self.createEmptyText										= function(left, top){
		var dx = left - self.s_point.x;
		var dy = top - self.s_point.y;
		
		var text = new fabric.IText('Text', {
			left: left,
			top: top,
			fontSize: 14,
			fill: 'black',
			hasControls: false,
			hasBorders: true,
			originX: 'left',
			originY: 'top',
			dx: dx,
			dy: dy,
			class: 'line',
			self: self
		});
		
		return text;
	};
	
	self.adjustPositionforText									= function(){
		var left, top;
		for(var i = 0; i < self._texts.length; i ++){
			left = self.s_point.x + self._texts[i].dx;
			top = self.s_point.y + self._texts[i].dy
			self._texts[i].set({left: left, top: top});
			self._texts[i].setCoords();
		}
	};
	
	self.updatePosforText										= function(obj){
		var left, top;
		for(var i = 0; i < self._texts.length; i ++){
			if(obj == self._texts[i]){
				left = self._texts[i].left;
				top = self._texts[i].top;
				self._texts[i].dx = left - self.s_point.x;
				self._texts[i].dy = top - self.s_point.y;
				return;
			}
		}
	};
	
	self.changeBoldforText										= function(obj, isremove){
		if( self._texts.length == 0 )
			return;
		var value = (isremove == true) ? 'normal': 'bold';
		for(var i = 0; i < self._texts.length; i ++){
			if(obj == self._texts[i]){
				self._texts[i].set({ 'fontWeight' : value});
				self._texts[i].setCoords();
				return;
			}
		}
		
		for(var i = 0; i < self._texts.length; i ++){
			self._texts[i].set({ 'fontWeight' : value});
			self._texts[i].setCoords();
		}
	};
	self.changeItalicforText										= function(obj, isremove){
		if( self._texts.length == 0 )
			return;
		var value = (isremove == true) ? 'normal': 'italic';
		for(var i = 0; i < self._texts.length; i ++){
			if(obj == self._texts[i]){
				self._texts[i].set({ 'fontStyle' : value});
				self._texts[i].setCoords();
				return;
			}
		}
		
		for(var i = 0; i < self._texts.length; i ++){
			self._texts[i].set({ 'fontStyle' : value});
			self._texts[i].setCoords();
		}
	};
	self.changeDecorationforText										= function(obj, name, isremove){
		if( self._texts.length == 0 )
			return;
		
		var value = (isremove == true) ? '': name;
		for(var i = 0; i < self._texts.length; i ++){
			if(obj == self._texts[i]){
				self._texts[i].set({ 'textDecoration' : value});
				self._texts[i].setCoords();
				return;
			}
		}
		
		for(var i = 0; i < self._texts.length; i ++){
			self._texts[i].set({ 'textDecoration' : value});
			self._texts[i].setCoords();
		}
	};
	self.changeAlignforText										= function(obj, name){
		if( self._texts.length == 0 )
			return;
		for(var i = 0; i < self._texts.length; i ++){
			if(obj == self._texts[i]){
				self._texts[i].set({ 'textAlign' : name});
				self._texts[i].setCoords();
				return;
			}
		}
		for(var i = 0; i < self._texts.length; i ++){
			self._texts[i].set({ 'textAlign' : name});
			self._texts[i].setCoords();
		}
	};
	
	self.changeFontforText										= function(obj, name){
		if( self._texts.length == 0 )
			return;
			
		for(var i = 0; i < self._texts.length; i ++){
			if(obj == self._texts[i]){
				self._texts[i].set({ 'fontFamily' : name});
				self._texts[i].setCoords();
				return;
			}
		}
		for(var i = 0; i < self._texts.length; i ++){
			self._texts[i].set({ 'fontFamily' : name});
			self._texts[i].setCoords();
		}
	};
	self.changeFontSizeforText										= function(obj, name){
		if( self._texts.length == 0 )
			return;
			
		for(var i = 0; i < self._texts.length; i ++){
			if(obj == self._texts[i]){
				self._texts[i].set({ 'fontSize' : name});
				self._texts[i].setCoords();
				return;
			}
		}
		for(var i = 0; i < self._texts.length; i ++){
			self._texts[i].set({ 'fontSize' : name});
			self._texts[i].setCoords();
		}
	};
	self.changeFontColorforText										= function(obj, name){
		if( self._texts.length == 0 )
			return;
			
		for(var i = 0; i < self._texts.length; i ++){
			if(obj == self._texts[i]){
				self._texts[i].set({ 'fill' : name});
				self._texts[i].setCoords();
				return;
			}
		}
		for(var i = 0; i < self._texts.length; i ++){
			self._texts[i].set({ 'fill' : name});
			self._texts[i].setCoords();
		}
	};
	self.changeColorforLine											= function(obj, name){
		self._line_color = name;
		self._line_object.setStroke(name);
		self.drawLine();
	};
	
	self.lineDistance												= function( x0,y0, x1,y1 ){
		var xs = 0;
		var ys = 0;
		xs = x1 - x0;
		xs = xs * xs;
		ys = y1 - y0;
		ys = ys * ys; 
		return Math.sqrt( xs + ys );
	};
	
	self.setTextPosition											= function( obj ){
		var oP = obj.getCenterPoint();
		var setable = new Array();
		self.deltaText = 0;
		var result = {
			x: 0,
			y: 0,
			delta: 0,
		};
		var distance = 0;
		var total = 0;
		var tdt = 0;
		var angleDeg = 0;
		
		for( var i = 0; i < self.boundPoints.length; i += 2 ){
			angleDeg = Math.atan2(self.boundPoints[i + 1].y - self.boundPoints[i].y, self.boundPoints[i + 1].x - self.boundPoints[i].x) * 180 / Math.PI;
			total += self.lineDistance(self.boundPoints[i].x, self.boundPoints[i].y, self.boundPoints[i + 1].x, self.boundPoints[i + 1].y);
		}
		
		for( var i = 0; i < self.boundPoints.length; i += 2 ){
			angleDeg = Math.atan2(self.boundPoints[i + 1].y - self.boundPoints[i].y, self.boundPoints[i + 1].x - self.boundPoints[i].x) * 180 / Math.PI;
			var tDist = self.lineDistance(self.boundPoints[i].x, self.boundPoints[i].y, self.boundPoints[i + 1].x, self.boundPoints[i + 1].y);
			
			for(var dt = 0; dt < tDist; dt += 5){
				var dx = Math.cos(angleDeg / 180 * Math.PI) * dt;
				var dy = Math.sin(angleDeg / 180 * Math.PI) * dt;
				var x1 = self.boundPoints[i].x + dx;
				var y1 = self.boundPoints[i].y + dy;
				
				tdt += 5;
				distance = self.lineDistance(oP.x, oP.y, x1, y1);
				if( self.deltaText >= distance || (i == 0 && dt == 0) )
				{
					self.deltaText = distance;
					result.x = x1;
					result.y = y1;
					result.delta = tdt / total;
				}
			}
		}
		return result;
	};
	
	self.updateTextPosition											= function(){
		var distance = 0;
		var total = 0;
		var tdt = 0;
		var angleDeg = 0;
		var nextflag = false;
		
		for( var i = 0; i < self.boundPoints.length; i += 2 ){
			angleDeg = Math.atan2(self.boundPoints[i + 1].y - self.boundPoints[i].y, self.boundPoints[i + 1].x - self.boundPoints[i].x) * 180 / Math.PI;
			total += self.lineDistance(self.boundPoints[i].x, self.boundPoints[i].y, self.boundPoints[i + 1].x, self.boundPoints[i + 1].y);
		}
		
		for( var j = 0; j < self._texts.length; j ++ ){
			var text_item = self._texts[j];
			nextflag = false;
			tdt = 0;
			
			for( var i = 0; i < self.boundPoints.length; i += 2 ){
				angleDeg = Math.atan2(self.boundPoints[i + 1].y - self.boundPoints[i].y, self.boundPoints[i + 1].x - self.boundPoints[i].x) * 180 / Math.PI;
				var tDist = self.lineDistance(self.boundPoints[i].x, self.boundPoints[i].y, self.boundPoints[i + 1].x, self.boundPoints[i + 1].y);
				
				for(var dt = 0; dt < tDist; dt += 5){
					tdt += 5;
					if( text_item.delta <= (tdt / total) ){
						var dx = Math.cos(angleDeg / 180 * Math.PI) * dt;
						var dy = Math.sin(angleDeg / 180 * Math.PI) * dt;
						var x1 = self.boundPoints[i].x + dx;
						var y1 = self.boundPoints[i].y + dy;
						
						text_item.setLeft(x1 - text_item.getWidth() / 2);
						text_item.setTop(y1 - text_item.getHeight() / 2);
						text_item.setCoords();
						nextflag = true;
						break;
					}
				}
				
				if(nextflag == true)
					break;
			}
		}
		self.canvas.renderAll();
	};
	
	{
		self._initialize( option );
	}
}

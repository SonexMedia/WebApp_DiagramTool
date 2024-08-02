var CLASS_FULCRA								= function(id, w, h){
	"use strict";
	var self									= this;

	self._height								= 0;
	self._width									= 0;
	self._zoom									= 1;
	self._canvasId								= '';
	self._f_canvas								= null;
	self._loaded_count							= 0;
	self._total_count							= 0;
	self._curline								= null;
	self.click_line								= null;
	self.dragObj								= 0;
	self.isDrag 								= 0;

	self.fitGridX								= 20;
	self.fitGridY 								= 20;
	self.minDist								= 20;
	self.objRuler 								= null;

	self.canvSize 								= "A3";
	self.canvOrient 							= "Landscape";
	self.state 									= [];
	self.sIndex 								= -1;
	self.objArr 								= [];
	self.unit 									= "Millimeter";
	
	self.autosave 								= "None";
	self.autoTimer 								= null;
	self.isLock 								= "Unlock";
	self.export_mode 							= "JSON";
	self.tmpGroupObj 							= null;
	
	MyEvents.apply(this);
	
	self._init_canvas							= function( id )
	{
		// var ret_value = new fabric.Canvas( id, 
		var ret_value = new fabric.CanvasWithViewport( id, 
		{
			hoverCursor: 'pointer',
			renderOnAddition: false,
			selectionColor: 'rgba(255,255,255,0.1)',
			selectionBorderColor: 'rgba(100, 100, 255, 0.3)',
			selectionDashArray: [5, 5],
			isDrawingMode: false
		});
		
		ret_value.on(
		{
		  'keyboard:down' : self.onKeyDown,
		  'mouse:down' : self.onMouseDown,
		  'touch:start' : self.onMouseDown,
		  'mouse:up' : self.onMouseUp,
		  'touch:end' : self.onMouseUp,
		  'mouse:move' : self.onMouseMove,
		  'touch:move' : self.onMouseMove,
		  'mouse:over' : self.onMouseOver,
		  'mouse:out': self.onMouseOut,
		  'object:selected': self.onObjectSelected,
		  'selection:cleared': self.onObjectCleared,
		  'object:scaling' : self.onObjectScaling,
		  'object:moving' : self.onObjectMoving,
		  'object:rotating' : self.onObjectRotating,
		  'path:created' 	: self.onPathCreated,
		  'object:modified' : self.onObjectModified
		});

		$(document).on("keydown",function(evt)
		{
			var active_obj = self._f_canvas.getActiveObject();

			if(!active_obj)
				active_obj = self._f_canvas.getActiveGroup();

			if(!active_obj)
				return;

			switch(evt.keyCode)
			{
				case 46 : 
					active_obj.self.fireEvent("Delete");
				break;
			}

			self._f_canvas.renderAll();
		});
		
		self.addEventListener("loadModel", function(e) 
		{
			self._init_Shape(e.id1, e.id2);
		});
		
		self._init_Shape(0, 0);
		return ret_value;
	}

	self.onKeyDown 								= function( e )
	{
		console.log(e);
	}
	
	self.onMouseDown							= function( e )
	{
		if(self._f_canvas.getActiveGroup() || (e.target && e.target.class == "group"))
			return;

		if(self.click_line != null)
		{
			self._f_canvas.selection = false;
			
			switch(self.click_line){
			case 'AnchorLine':
				var option = {
					's_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'e_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'line_style': 'style-2',
				};
				self._curline = new CLASS_LINE( self._f_canvas, option );			
				break;
			case 'AsyncMessage':
				var option = {
					's_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'e_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'rshape_name': 'arrow',
				};
				
				self._curline = new CLASS_LINE( self._f_canvas, option );
				break;
			case 'InitializeMessage':
				var option = {
					's_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'e_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'line_style': 'style-2',
					'rshape_name': 'arrow',
				};
				
				self._curline = new CLASS_LINE( self._f_canvas, option );
				break;
			case 'ReturnMessage':
				var option = {
					's_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'e_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'lshape_name': 'arrow',
					'line_style': 'style-2'
				};
				
				self._curline = new CLASS_LINE( self._f_canvas, option );
				break;
			case 'SyncMessage':
				var option = {
					's_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'e_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'rshape_name': 'triangle-fill',
				};
				
				self._curline = new CLASS_LINE( self._f_canvas, option );
				break;
				
			case 'FoundMessage':
				var option = {
					's_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'e_point': new fabric.Point(e.e.layerX, e.e.layerY),
					'lshape_name': 'circle-fill',
					'rshape_name': 'arrow',
				};
				
				self._curline = new CLASS_LINE( self._f_canvas, option );
				break;
			}
			return;
		}
		
		if(e.target != null && e.target.self != 'undefined' && e.target.self.type == 'connector'){
			self._f_canvas.selection = false;
			var option = {
				's_connector': e.target.self,
				's_point': e.target.self.getCenterPoint(e.e.layerX, e.e.layerY),
				'e_point': e.target.self.getCenterPoint(e.e.layerX, e.e.layerY),
			};
			
			self._curline = new CLASS_LINE( self._f_canvas, option );
		}
	}
	self.onMouseUp								= function( e )
	{
		if(self._f_canvas.getActiveGroup() || (e.target && e.target.class == "group"))
			return;
		
		$(".item-clicked").removeClass("item-clicked");
		self._f_canvas.selection = true;
		self.click_line = null;
		
		if(self._curline != null){
			if( e.target != null && e.target.self.type == 'connector' ){
				self._curline.e_connector = e.target.self;
				e.target.self.addLinkLine( self._curline );
			}
			self._curline.drawLine( );
			
			self._curline = null;
			self._f_canvas.selection = true;
		}else if(e.target != null && e.target.self != 'undefined' && e.target.self.type == 'line'){
			e.target.self.fireEvent("MouseUp", {target: e.target});
		}

		self.clearGuideLines();
	}

	self.onMouseMove							= function( e )
	{
		self.updateStatus(e, "pos");

		if(self.isDrag)
		{
			var childObj = self.dragObj.shape.getObjects();
			var newX, newY;

			var left, top;

			for(var i = 0; i < self.dragObj.connectors.length; i ++)
				self.dragObj.connectors[i].fireEvent("update");
				
			for(var i = 0; i < self.dragObj._texts.length; i ++)
				self.dragObj._texts[i].fireEvent("change");

			left 	= (event.offsetX - Fulcra._f_canvas.viewport.position.x - Fulcra._f_canvas.viewport.grabPointer.x + Fulcra._f_canvas.viewport.grabStartPointer.x) / Fulcra._f_canvas.viewport.zoom;
			top  	= (event.offsetY - Fulcra._f_canvas.viewport.position.y - Fulcra._f_canvas.viewport.grabPointer.y + Fulcra._f_canvas.viewport.grabStartPointer.y) / Fulcra._f_canvas.viewport.zoom;

			newX = Math.ceil(left / self.fitGridX) * self.fitGridX;
			newY = Math.ceil(top  / self.fitGridY) * self.fitGridY;

			self.dragObj.shape.setCoords();
			self.dragObj.shape.set({left : newX, top : newY});
			self.dragObj.shape.canvas.calcOffset().renderAll();

			self.showGuideLineForMoving();
		}

		if(self._curline != null)
		{
			var point = {x: e.e.layerX, y: e.e.layerY};

			if( e.target != null && e.target.self.type == 'connector' )
			{
				point = e.target.self.getCenterPoint( e.e.layerX, e.e.layerY );
			}

			self._curline.e_point = point;
			self._curline.drawLine( );
		}
	}

	self.onObjectSelected						= function( e )
	{
		var index = 0;

		self.updateStatus(e, "size");
		self.updateStatus(e, "angle");

		if(self._selected_shape != null && self._selected_shape.self != 'undefined')
			self._selected_shape.self.fireEvent("Cleared");

		if(self._f_canvas.getActiveGroup() || (e.target && e.target.class == "group"))
		{
			self.tmpGroupObj = self._f_canvas.getActiveGroup();
			return;
		}
			
		if(e.target != null && e.target.self != 'undefined' && (e.target.self.type == 'shape' || e.target.self.type == 'text' || e.target.self.type == 'line'))
			e.target.self.fireEvent("Selected", { 'target': e.target, 'e': e.e });

		self._selected_shape = e.target;

		if(self._selected_shape)
			index = self._selected_shape.self.ind;
		
		self.objLayer.selObject(index);
	}

	self.onObjectCleared						= function( e )
	{
		self.updateStatus(e, "size");
		self.updateStatus(e, "angle");

		if(self.tmpGroupObj)
		{
			self.updateShapeOfGroup();
			self.tmpGroupObj = null;
		}

		if(self._selected_shape != null && self._selected_shape.self != 'undefined')
			self._selected_shape.self.fireEvent("Cleared");
			
		if( e.target != null && e.target.self != 'undefined' && (e.target.self.type == 'shape' || e.target.self.type == 'line' ))
			e.target.self.fireEvent("Cleared");
		self._selected_shape = null;
	}

	self.onObjectScaling						= function( e )
	{
		var nWidth, nHeight;
		var oWidth, oHeight;

		var scaleX, scaleY;
		var obj = self._f_canvas.getActiveObject();

		self.updateStatus(e, "size");

		if(self._f_canvas.getActiveGroup() || (e.target && e.target.class == "group"))
			return;

		if(obj.get("class") == "shape")
		{
			scaleX 	= obj.get('scaleX');
			scaleY 	= obj.get('scaleY');

			oWidth 	= obj.get('width');
			oHeight = obj.get('height');

			nWidth 	= Math.ceil(obj.get('width')  * scaleX  / self.fitGridX) * self.fitGridX;
			nHeight	= Math.ceil(obj.get('height') * scaleY  / self.fitGridY) * self.fitGridY;

			scaleX	= nWidth  / oWidth;
			scaleY 	= nHeight / oHeight;

			// obj.set({scaleX : scaleX, scaleY : scaleY});

			self.clearGuideLines();
			self.guideLineForSize();
		}

		e.target.self.fireEvent("update", { 'target': e.target });
	}
	
	self.onObjectMoving							= function( e )
	{
		if(self._f_canvas.getActiveGroup() || (e.target && e.target.class == "group"))
			return;

		if((e.target && e.target.self.shape) && (e.target.self.shape.get("class") == "shape"))
		{
			var newX = Math.ceil(e.target.self.shape.get('left') / self.fitGridX) * self.fitGridX;
			var newY = Math.ceil(e.target.self.shape.get('top')  / self.fitGridY) * self.fitGridY;

			e.target.self.shape.set({"left" : newX, "top" : newY});

			self.dragObj = e.target.self;
			self.showGuideLineForMoving();
		}

		e.target.self.fireEvent("update", { 'target': e.target });
	}

	self.onPathCreated 							= function( e )
	{
		console.log("create");
	}

	self.onObjectModified						= function( e )
	{
		self.clearGuideLines();
		self.dragObj = null;
		self.recAction();
	}

	self.onObjectRotating						= function( e )
	{
		if(self._f_canvas.getActiveGroup() || (e.target && e.target.class == "group"))
			return;

		self.updateStatus(e, "angle");

		e.target.self.fireEvent("update", { 'target': e.target });
	}

	self.onMouseOver							= function( e )
	{
		if(e.target.get("class") == "guide_line")
			return;

		if(self._f_canvas.getActiveGroup() || (e.target && e.target.class == "group"))
			return;

		if(self._f_canvas.getActiveObject() != e.target)
		{
			if(e.target != null && e.target.self != 'undefined' && e.target.self.type == 'connector')
			{
				setTimeout( function(){ e.target.self.fireEvent("MouseOver"); }, 50);
			}
			else
				e.target.self.fireEvent("MouseOver");
		}
	}

	self.onMouseOut								= function( e )
	{
		if(!e.target || !e.target.self)
			return;

		e.target.self.fireEvent("MouseOut");
	}

	self.updateShapeOfGroup 					= function()
	{
		var activeGroup = self.tmpGroupObj;
		
		if(!activeGroup)
			return;

		activeGroup.forEachObject(function(obj)
		{
			if(obj.class != "shape")
				return;

			obj.setCoords();
			self._f_canvas.calcOffset();
			obj.self.fireEvent("update", { 'target': obj });
		});
	}

	self._loadSVGfile							= function(path, index1, index2)
	{
		fabric.loadSVGFromURL(path, function (objects, options)
		{
			var key1 = index1, key2 = index2;			
			var pathGroup = fabric.util.groupSVGElements(objects, options);
			var left = 0, top = 0;
			
			for(var i = 0; i < objects.length; i ++)
			{
				if(objects[i].get('type') == 'text')
				{
					var matrix = objects[i].get("transformMatrix");
					
					if(matrix.length < 6)
					{
						left = objects[i].left - (objects[i].width / 2);
						top = objects[i].top - (objects[i].height / 2);
					}
					else
					{
						left = matrix[4] - ( options.width / 2 - (objects[i].getWidth() / 2));
						top = matrix[5] - ( (options.height / 2) + (objects[i].getHeight() / 2));
					}

					pathGroup.paths[i].set({left: left, top: top});
				}
			}

			Component[key1].data[key2].model = pathGroup;
			key2 ++;
			self.fireEvent("loadModel", { 'id1': key1, 'id2': key2 });
			self._loaded_count ++;
			console.log(self._loaded_count);
		});
	}
	
	self._init_Shape							= function(index1, index2){
		var i = index1, j = index2;

		if(i >= Component.length)
			return;
		if(typeof Component[i].data == 'undefined' || j >= Component[i].data.length){
			j = 0;
			i ++;
		}
		if(i >= Component.length)
			return;
		if(typeof Component[i].data == 'undefined'){
			i ++;
			self.fireEvent("loadModel", { 'id1': i, 'id2': 0 });
			return;
		}
		
		var path = Component[i].data[j].svg;
		self._loadSVGfile(path, i, j);
		
	}
	self.initialize								= function(id, w, h){
		self._height = h;
		self._width = w;
		self._canvasId = id

		self._f_canvas = self._init_canvas(id);
		self.initMenuEvents();
	}
	
	self.drawComponent							= function(strClass, shape, x, y, key1, key2)
	{
		console.log(strClass);
		var strCmd 	= 'new ' + strClass + '(' + x + ',' + y + ', shape, self._f_canvas);';
		var object 	= eval(strCmd);

		var shape  	= object.getShape();

		shape.key1 	= key1;
		shape.key2 	= key2;

		return object;
	}
	
	self.initMenuEvents				= function(){
		/*Bold*/
		$('#text-bold').click(function(){
			if(self._selected_shape != null && self._selected_shape.class == 'text'){
				if($(this).hasClass("active")){
					$(this).removeClass("active");
					self._selected_shape.set({fontWeight: 'normal'});
				}else{
					$(this).addClass("active");
					self._selected_shape.set({fontWeight: 'bold'});
				}
				self._f_canvas.renderAll();
			}
		});
		/*Italic*/
		$('#text-italic').click(function(){
			if(self._selected_shape != null && self._selected_shape.class == 'text'){
				if($(this).hasClass("active")){
					$(this).removeClass("active");
					self._selected_shape.set({fontStyle: 'normal'});
				}else{
					$(this).addClass("active");
					self._selected_shape.set({fontStyle: 'italic'});
				}
				self._f_canvas.renderAll();
			}
		});
		/*underline*/
		$('#text-underline').click(function(){
			if(self._selected_shape != null && self._selected_shape.class == 'text'){
				$("#text-center").removeClass("active");
				
				if($(this).hasClass("active")){
					$(this).removeClass("active");
					self._selected_shape.set({textDecoration: ''});
				}else{
					$(this).addClass("active");
					self._selected_shape.set({textDecoration: 'underline'});
				}
				self._f_canvas.renderAll();
			}
		});
		/*underline*/
		$('#text-center').click(function(){
			if(self._selected_shape != null && self._selected_shape.class == 'text'){
				$("#text-underline").removeClass("active");
				
				if($(this).hasClass("active")){
					$(this).removeClass("active");
					self._selected_shape.set({textDecoration: ''});
				}else{
					$(this).addClass("active");
					self._selected_shape.set({textDecoration: 'line-through'});
				}
				self._f_canvas.renderAll();
			}
		});
		/*fontSize*/
		$('#select-fontsize').change(function () {
			 var optionSelected = $(this).find("option:selected");
			 var valueSelected  = optionSelected.val();
			 
			 if(self._selected_shape != null && self._selected_shape.class == 'text'){
				 self._selected_shape.set({fontSize: valueSelected});
				 self._f_canvas.renderAll();
			 }
			 
		 });

		$("#btn-undo").click(function()
		{
			self.undo();
		});

		$("#btn-redo").click(function()
		{
			self.redo();
		});

		$("#btn_copy").click(function()
		{
			var object 	= self._f_canvas.getActiveObject();
			var s_info 	= {key1 : object.key1, key2 : object.key2, left : object.left, top : object.top};

			localStorage.setItem("saved_obj", JSON.stringify(s_info));
		});

		$("#btn_cut").click(function()
		{
			var object 	= self._f_canvas.getActiveObject();
			var s_info 	= {key1 : object.key1, key2 : object.key2, left : object.left, top : object.top};

			localStorage.setItem("saved_obj", JSON.stringify(s_info));

			self._selected_shape.self.fireEvent("Delete", { 'target': self._selected_shape });
		});

		$("#btn_paste").click(function()
		{
			var saved 	= JSON.parse(localStorage.getItem("saved_obj"));
			var obj 	= getClassNamefromKey(saved.key1, saved.key2);
			var dragObj = Fulcra.drawComponent(obj.class, obj.model, saved.left, saved.top, saved.key1, saved.key2);

			dragObj = dragObj.self;
			dragObj.fireEvent("update", { 'target': dragObj });

			// self._f_canvas.add(dragObj);
			self._f_canvas.renderAll();
		});

		$("#btn_group").click(function()
		{
			var group  		= self._f_canvas.getActiveGroup();
			var addGroup 	= fabric.util.object.clone(group);
			var idArr 		= [];

			if(!group)
				return;

			addGroup.class = "group";

			self._f_canvas.add(addGroup);

			group.forEachObject(function(obj)
			{
				self._f_canvas.remove(obj);
			});

			self._f_canvas.deactivateAll();

			addGroup.forEachObject(function(obj)
			{
				obj.set({left : obj.left - addGroup.left, top : obj.top - addGroup.top});

				if(!obj.text)
				{
					if(obj.self)
						idArr.push(obj.self.ind);
				}
			});

			self.objLayer.addGroup(idArr);
			self._f_canvas.renderAll();
		});

		$("#btn_ungroup").click(function()
		{
			var sel_group 	= self._f_canvas.getActiveObject();
			var idArr 		= [];
			var shapeArr 	= [];

			if(!sel_group)
				return;

			sel_group.forEachObject(function(shape)
			{
				if(shape.class != "shape")
					return;

				var left 	= sel_group.left + shape.left;
				var top 	= sel_group.top  + shape.top;

				var obj 	= getClassNamefromKey(shape.key1, shape.key2);
				var dragObj = Fulcra.drawComponent(obj.class, obj.model, left, top, shape.key1, shape.key2);

				dragObj.ind 	= shape.self.ind;
				dragObj.key1 	= shape.self.key1;
				dragObj.key2 	= shape.self.key2;
				// dragObj 		= shape.self;

				// dragObj.shape.fireEvent("update", { 'target': dragObj });

				self._f_canvas.remove(sel_group);
				self._f_canvas.renderAll();

				idArr.push(dragObj.ind);
				shapeArr.push(dragObj);

				return false;
			});

			self.objLayer.delGroup(idArr, shapeArr);
		});

		$("#btn_lock").click(function()
		{
			self.lockCanvas();
		});

		$("#btn_unlock").click(function()
		{
			self.unlockCanvas();
		});

		$("#btn-align-top").click(function()
		{
			var group  		= self._f_canvas.getActiveGroup();

			if(!group)
				return;

			group.forEachObject(function(child)
			{
				if(child.class != "shape")
					return;

				child.top = 0 - group.height / 2;
				child.self.fireEvent("update", { 'target': dragObj });
				self._f_canvas.renderAll();
			});
		});

		$("#btn-align-middle").click(function()
		{
			var group  		= self._f_canvas.getActiveGroup();

			if(!group)
				return;

			group.forEachObject(function(child)
			{
				if(child.class != "shape")
					return;

				child.top = child.height / 2 - group.height / 2;
				child.self.fireEvent("update", { 'target': dragObj });
				self._f_canvas.renderAll();
			});
		});

		$("#btn-align-bottom").click(function()
		{
			var group  		= self._f_canvas.getActiveGroup();

			if(!group)
				return;

			group.forEachObject(function(child)
			{
				if(child.class != "shape")
					return;

				child.top = group.height / 2 - child.height;
				child.self.fireEvent("update", { 'target': dragObj });
				self._f_canvas.renderAll();
			});
		});

		$("#btn-align-left").click(function()
		{
			var group  		= self._f_canvas.getActiveGroup();

			if(!group)
				return;

			group.forEachObject(function(child)
			{
				if(child.class != "shape")
					return;

				child.left = 0 - group.width / 2;
				child.self.fireEvent("update", { 'target': dragObj });
				self._f_canvas.renderAll();
			});
		});

		$("#btn-align-center").click(function()
		{
			var group  		= self._f_canvas.getActiveGroup();

			if(!group)
				return;

			group.forEachObject(function(child)
			{
				if(child.class != "shape")
					return;

				child.left = 0 - child.width / 2;
				child.self.fireEvent("update", { 'target': dragObj });
				self._f_canvas.renderAll();
			});
		});

		$("#btn-align-right").click(function()
		{
			var group  		= self._f_canvas.getActiveGroup();

			if(!group)
				return;

			group.forEachObject(function(child)
			{
				if(child.class != "shape")
					return;

				child.left = 0 + group.width / 2 - child.width;
				child.self.fireEvent("update", { 'target': dragObj });
				self._f_canvas.renderAll();
			});
		});
		 
		 /**/
		$('#select-delete').click(function()
		{
			if(self._selected_shape == null || typeof (self._selected_shape.self) == 'undefined')
				return;
			
			self._selected_shape.self.fireEvent("Delete", { 'target': self._selected_shape });
		});

		$('#select-movefront').click(function()
		{
			self._selected_shape.bringToFront();
			self._selected_shape.self.fireEvent("bringFront");
		});

		$('#select-moveback').click(function()
		{
			self._selected_shape.self.fireEvent("sendBack");
			self._selected_shape.sendToBack();
		});
	};

	self.recAction 											= function()
	{
		var json = self.canvasToJSON();

		self.state = self.state.splice(0, self.sIndex + 1);
		self.sIndex ++;
		self.state.push(json);
	}

	self.canvasToJSON 	= function()
	{
		var json_arr	= [];
		var json_data	= [];

		var shape		= null;
		var textArr		= [];
		var connArr		= [];

		for(var i = 0; i < self.objArr.length; i ++)
		{
			textArr		= [];
			connArr		= [];

			shape 		= 
			{
				left 	: self.objArr[i].shape.left,
				top 	: self.objArr[i].shape.top,
				width 	: self.objArr[i].shape.width,
				height 	: self.objArr[i].shape.height,
			}

			for(var j = 0; j < self.objArr[i]._texts.length; j ++)
			{
				textArr.push(
				{
					left 	: self.objArr[i]._texts[j]._left1,
					top 	: self.objArr[i]._texts[j]._top1,
					text 	: self.objArr[i]._texts[j]._text.text
				});
			}

			json_data.push(
			{
				key1 	: self.objArr[i].key1,
				key2 	: self.objArr[i].key2,
				shape 	: shape,
				text 	: textArr
			});
		}

		return JSON.stringify(json_data);
	}

	self.jsonToCanvas 	= function(data)
	{
		var key1, key2, obj, dragObj;

		self._f_canvas.clear().renderAll();

		for(var i = 0; i < data.length; i ++)
		{
			key1 	= data[i].key1;
			key2 	= data[i].key2;

			obj 	= getClassNamefromKey(key1, key2);
			dragObj = Fulcra.drawComponent(obj.class, obj.model, data[i].shape.left, data[i].shape.top, key1, key2);

			dragObj.shape.width 	= data[i].shape.width;
			dragObj.shape.height 	= data[i].shape.height;

			for(var j = 0; j < dragObj._texts.length; j ++)
			{
				dragObj._texts[j]._left1 		= data[i].text[j].left;
				dragObj._texts[j]._top1 		= data[i].text[j].top;
				dragObj._texts[j]._text.text 	= data[i].text[j].text;
				dragObj._texts[j].fireEvent("change");
			}

			dragObj.fireEvent("update", { 'target': dragObj });

			self.objArr[i] 		= dragObj;
			self.objArr[i].key1 = key1;
			self.objArr[i].key2 = key2;
		}

		self._f_canvas.renderAll();
	}

	self.undo 												= function()
	{
		var data;

		if(self.sIndex == 0)
			return;

		self.sIndex --;
		data = JSON.parse(self.state[self.sIndex]);	
		self.jsonToCanvas(data);
	}

	self.redo 												= function()
	{
		var data;

		if(self.sIndex >= self.state.length - 1)
			return;

		self.sIndex ++;
		data = JSON.parse(self.state[self.sIndex]);	
		self.jsonToCanvas(data);
	}

	self.changeLineType 									= function(type){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.line_type = type;
			self._selected_shape.self.drawLine();
		}
	};
	self.changeLineStyle 									= function(style){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.line_style = style;
			self._selected_shape.self.drawLine();
		}
	};
	self.changeLineWidth 									= function(width){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			var res = width.split("line-width-");
			self._selected_shape.self.line_width = parseInt(res[1]);
			self._selected_shape.self.drawLine();
		}
	};
	
	self.changeLeftLinePoint								= function(pName){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.lshape_name = pName;
			self._selected_shape.self.drawLine();
		}
	};
	self.changeRightLinePoint								= function(pName){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.rshape_name = pName;
			self._selected_shape.self.drawLine();
		}
	};
	
	self.changeBoldforLineText								= function(isRemove){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.changeBoldforText(self._selected_shape, isRemove);
			self._f_canvas.renderAll();
		}
	};
	self.changeItalicforLineText								= function(isRemove){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.changeItalicforText(self._selected_shape, isRemove);
			self._f_canvas.renderAll();
		}
	};
	self.changeDecorationforText								= function(name, isRemove){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.changeDecorationforText(self._selected_shape, name, isRemove);
			self._f_canvas.renderAll();
		}
	};
	
	self.changeAlignforText										= function(name, isRemove){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.changeAlignforText(self._selected_shape, name);
			self._f_canvas.renderAll();
		}
	};
	
	self.changeFontforText										= function(name){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.changeFontforText(self._selected_shape, name);
			self._f_canvas.renderAll();
		}
	};
	
	self.changeFontSizeforText									= function(name){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.changeFontSizeforText(self._selected_shape, name);
			self._f_canvas.renderAll();
		}
	};
	
	self.changeFontColorforText									= function(name){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.changeFontColorforText(self._selected_shape, name);
			self._f_canvas.renderAll();
		}
	};
	
	self.changeColorforLine										= function( name ){
		if(self._selected_shape != null && self._selected_shape.self != 'undefined' && self._selected_shape.self != 'null' && self._selected_shape.self.type == 'line'){
			self._selected_shape.self.changeColorforLine(self._selected_shape, name);
			self._f_canvas.renderAll();
		}
	};
	
	{
		self.initialize(id, w, h);
	}

	self.clearGuideLines 										= function()
	{
		self._f_canvas.forEachObject(function (obj)
		{
			if(obj.class != "guide_line")
				return;

			self._f_canvas.remove(obj);
		});
	};

	self.showGuideLineForMoving   								= function()
	{
		if(!self.dragObj)
			return;

		var sizeObjHArr = [];
		var sizeObjVArr = [];

		self.clearGuideLines();

		self._f_canvas.forEachObject(function (obj)
		{
			if(obj.class != "shape")
				return;

			if(self.dragObj.shape == obj)
				return;

			self.guideLineForPosition(obj);

			// Check Distance Similar

			if( ((self.dragObj.shape.left <= obj.left) && (self.dragObj.shape.left + self.dragObj.shape.width >= obj.left)) || 
				((self.dragObj.shape.left >= obj.left) && (self.dragObj.shape.left <= obj.left + obj.width)) )
			{
				if(self.getDistance(self.dragObj.shape, obj, "virtical") > 0)
					sizeObjVArr.push(obj);
			}


			if( ((self.dragObj.shape.top <= obj.top) && (self.dragObj.shape.top + self.dragObj.shape.height >= obj.top)) || 
				((self.dragObj.shape.top >= obj.top) && (self.dragObj.shape.top <= obj.top + obj.height)) )
			{
				if(self.getDistance(self.dragObj.shape, obj, "horizontal") > 0)
					sizeObjHArr.push(obj);
			}

		});

		// Check Distance Similar

		self.guideLineForDistance(sizeObjVArr, sizeObjHArr);
		self.dragObj.fireEvent("update", { 'target': self.dragObj });
	}

	self.guideLineForPosition 			= function(obj)
	{
		var x1, x2, y1, y2;
		var l_x1, l_x2, l_y1, l_y2;

		x1 = self.dragObj.shape.left;
		y1 = self.dragObj.shape.top;// - self.dragObj.shape.height / 2;

		x2 = obj.left;
		y2 = obj.top;// - obj.height / 2;

		// ------------------- check X Area --------------------//
		// checking x for left

		l_y1 = Math.min(y1,y2);
		l_y2 = y1 > y2 ? ( y1 + self.dragObj.shape.height) : ( y2 + obj.height);

		if(Math.abs(x1 - x2) < self.fitGridX / 2)
		{
			// self.dragObj.shape.set({left : x2});
			self.dragObj.shape.canvas.add(new fabric.Line([x1, l_y1, x2, l_y2],
			{
				class 			: "guide_line",
				left 			: x1,
				top 			: l_y1,
				strokeDashArray : [3, 3],
				stroke 			: '#5ac85a',
				strokeLineCap 	: "square",
				strokeWidth 	: 1
			}));
		}

		// checking x for right

		if(Math.abs((x1 + self.dragObj.shape.width) - (Math.ceil(x2 + obj.width))) < self.fitGridX / 2)
		{
			// self.dragObj.shape.set({left : x2 + obj.width - self.dragObj.shape.width});
			self.dragObj.shape.canvas.add(new fabric.Line([x2 + obj.width, l_y1, x2 + obj.width, l_y2],
			{
				class 			: "guide_line",
				left 			: x1 + self.dragObj.shape.width,
				top 			: l_y1,
				strokeDashArray : [3, 3],
				stroke 			: '#5ac85a',
				strokeLineCap 	: "square",
				strokeWidth 	: 1
			}));
		}

		// checking x for middle

		if(Math.abs((x1 + self.dragObj.shape.width / 2) - (Math.ceil(x2 + obj.width / 2))) < self.fitGridX / 2)
		{
			// self.dragObj.shape.set({left : x2 + obj.width / 2 - self.dragObj.shape.width / 2});
			self.dragObj.shape.canvas.add(new fabric.Line([x1 + self.dragObj.shape.width / 2, l_y1, x1 + self.dragObj.shape.width / 2, l_y2],
			{
				class 			: "guide_line",
				left 			: x1 + self.dragObj.shape.width / 2,
				top 			: l_y1,
				strokeDashArray : [3, 3],
				stroke 			: '#f1852d',
				strokeLineCap 	: "square",
				strokeWidth 	: 1
			}));
		}

		// ------------------- check Y Area --------------------//
		// checking y for top

		l_x1 = Math.min(x1, x2);
		l_x2 = x1 > x2 ? ( x1 + self.dragObj.shape.width) : ( x2 + obj.width);

		if(Math.abs(y1 - y2) < self.fitGridY / 2)
		{
			// self.dragObj.shape.set({top : y2});
			self.dragObj.shape.canvas.add(new fabric.Line([l_x1, y2, l_x2, y2],
			{
				class 			: "guide_line",
				left 			: l_x1,
				top 			: y1,
				strokeDashArray : [3, 3],
				stroke 			: '#5ac85a',
				strokeLineCap 	: "square",
				strokeWidth 	: 1
			}));
		}

		// checking y for bottom

		if(Math.abs((y1 + self.dragObj.shape.height) - (y2 + obj.height)) < self.fitGridY / 2)
		{
			// self.dragObj.shape.set({top : y2 + obj.height - self.dragObj.shape.height});
			self.dragObj.shape.canvas.add(new fabric.Line([l_x1, y2 + obj.height, l_x2, y2 + obj.height],
			{
				class 			: "guide_line",
				left 			: l_x1,
				top 			: y1 + self.dragObj.shape.height,
				strokeDashArray : [3, 3],
				stroke 			: '#5ac85a',
				strokeLineCap 	: "square",
				strokeWidth 	: 1
			}));
		}

		// checking y for middle

		if(Math.abs((y1 + self.dragObj.shape.height / 2) - (y2 + obj.height / 2)) < self.fitGridY / 2)
		{
			// self.dragObj.shape.set({top : y2 + obj.height / 2 - self.dragObj.shape.height / 2});
			// self.dragObj.shape.canvas.add(new fabric.Line([l_x1, y2 + obj.height / 2, l_x2, y2 + obj.height / 2],
			self.dragObj.shape.canvas.add(new fabric.Line([l_x1, 100, l_x2, 100],
			{
				class 			: "guide_line",
				left 			: l_x1,
				top 			: y1 + self.dragObj.shape.height / 2,
				strokeDashArray : [3, 3],
				stroke 			: '#f1852d',
				strokeLineCap 	: "square",
				strokeWidth 	: 1
			}));
		}
	}

	self.guideLineForDistance 			= function(sizeObjVArr, sizeObjHArr)
	{
		var mode_arr 	= ["virtical", "horizontal"];
		var sort_info, sObj_arr, sObj_mInd;
		var isDiffArr, sameDist, sameDistU, sameDistD;
		var sameArr,sameArrU, sameArrD;
		var prevObj, guideAngle = 0;
		var left,top;

		for(var mi = 0; mi < mode_arr.length; mi ++)
		{
			if(mode_arr[mi] == "virtical")
				sort_info 	= self.array_obj_sort(sizeObjVArr, self.dragObj.shape, mode_arr[mi]);
			else
				sort_info 	= self.array_obj_sort(sizeObjHArr, self.dragObj.shape, mode_arr[mi]);

			sObj_arr  	= sort_info.arr;
			sObj_mInd 	= sort_info.min_ind;

			if(!sObj_arr.length)
				continue;

			isDiffArr	= 0;
			
			sameDist 	= 0;
			sameDistU 	= 0;
			sameDistD 	= 0;

			sameArr 	= [];
			sameArrU 	= [];
			sameArrD 	= [];

			prevObj 	= self.dragObj.shape;

			if(sObj_mInd < sObj_arr.length)
			{
				for(var i = sObj_mInd; i < sObj_arr.length; i ++)
				{
					if(i == sObj_mInd)
					{
						sameDistU = self.getDistance(prevObj, sObj_arr[i], mode_arr[mi]);
						sameArrU.push(sObj_arr[i]);

					}
					else
					{
						if(Math.abs(self.getDistance(prevObj, sObj_arr[i], mode_arr[mi]) - sameDistU) >= self.fitGridX / 2)
							break;

						sameArrU.push(sObj_arr[i]);
					}

					prevObj = sObj_arr[i];
				}
			}

			prevObj 	= self.dragObj.shape;

			for(var i = sObj_mInd - 1; i >= 0; i --)
			{
				if(i == sObj_mInd - 1)
				{
					if(Math.abs(self.getDistance(prevObj, sObj_arr[i], mode_arr[mi]) - sameDistU) < self.fitGridX / 2)
					{
						sameDistD = sameDistU;
						sameArrU.push(sObj_arr[i]);
					}
					else
					{
						isDiffArr 	= 1;
						sameDistD 	= self.getDistance(prevObj, sObj_arr[i], mode_arr[mi]);
						sameArrD.push(sObj_arr[i]);
					}
				}
				else
				{
					if(Math.abs(self.getDistance(prevObj, sObj_arr[i], mode_arr[mi]) - sameDistD) >= self.fitGridX / 2)
						break;

					if(isDiffArr)
						sameArrD.push(sObj_arr[i]);
					else
						sameArrU.push(sObj_arr[i]);
				}

				prevObj = sObj_arr[i];
			}

			if(sameArrU.length > sameArrD.length)
			{
				sameArr 	= sameArrU;
				sameDist 	= sameDistU;
			}
			else
			{
				sameArr 	= sameArrD;
				sameDist 	= sameDistD;
			}

			if(sameArr.length < 2)
				continue;

			for(var i = 0; i < sameArr.length; i ++)
			{
				if(mode_arr[mi] == "virtical")
				{
					left = sameArr[i].left - sameArr[i].width / 2 - 5;
					guideAngle 	= 90;

					if(self.dragObj.shape.top > sameArr[i].top)
						top 	= sameArr[i].top + sameArr[i].height;
					else
						top 	= sameArr[i].top - sameArr[i].height / 2 - 10;
				}
				else
				{
					top = sameArr[i].top + sameArr[i].height + 5;
					guideAngle = 0;

					if(self.dragObj.shape.left > sameArr[i].left)
						left 	= sameArr[i].left - sameDist / 2 + sameArr[i].width;
					else
						left 	= sameArr[i].left - sameDist / 2 - sameDist;
				}

				var arrow_path = "M 0 -7 L 0 7 M 0 0 L " + sameDist + " 0 M 0 0 L 5 -3 M 0 0 L 5 3 M " + sameDist + " 0 L " + (sameDist - 5) + " -3 M " + sameDist + " 0 L " + (sameDist - 5) + " 3 M " + sameDist + " -7 L " + sameDist + " 7 z";
				var path = new fabric.Path(arrow_path, 
				{
					class 		: "guide_line",
					left 		: left,
					top 		: top,
					stroke 		: '#5ac85a',
					strokeWidth : 1,
					fill 		: false,
					angle 		: guideAngle
				});

				self.dragObj.shape.canvas.add(path);
			}
		}
	}

	self.guideLineForSize 				= function()
	{
		var active_obj  = self._f_canvas.getActiveObject();
		var arrow_path 	= null;
		var isWidthSame = 0;
		var isHghtSame 	= 0;

		self._f_canvas.forEachObject(function (obj)
		{
			if(obj.class != "shape")
				return;

			if(obj == active_obj)
				return;

			if(Math.abs(Math.ceil(active_obj.width) - Math.ceil(obj.width)) <= self.fitGridX / 2)
			{
				arrow_path = "M 0 -7 L 0 7 M 0 0 L " + obj.width + " 0 M 0 0 L 5 -3 M 0 0 L 5 3 M " + obj.width + " 0 L " + (obj.width - 5) + " -3 M " + obj.width + " 0 L " + (obj.width - 5) + " 3 M " + obj.width + " -7 L " + obj.width + " 7 z";

				self._f_canvas.add(new fabric.Path(arrow_path, 
				{
					left 		: obj.left - obj.width / 2,
					top 		: obj.top + obj.height + 10,
					stroke 		: '#5ac85a',
					strokeWidth : 1,
					fill 		: false,
					class 		: "guide_line"					
				}));

				isWidthSame = 1;
			}

			if(Math.abs(Math.ceil(active_obj.height) - Math.ceil(obj.height)) <= self.fitGridX / 2)
			{
				arrow_path = "M 0 -7 L 0 7 M 0 0 L " + obj.height + " 0 M 0 0 L 5 -3 M 0 0 L 5 3 M " + obj.height + " 0 L " + (obj.height - 5) + " -3 M " + obj.height + " 0 L " + (obj.height - 5) + " 3 M " + obj.height + " -7 L " + obj.height + " 7 z";

				self._f_canvas.add(new fabric.Path(arrow_path, 
				{
					left 		: obj.left - obj.height / 2 + obj.width + 25,
					top 		: obj.top,
					stroke 		: '#5ac85a',
					strokeWidth : 1,
					fill 		: false,
					angle 		: 90,
					class 		: "guide_line"					
				}));

				isHghtSame = 1;
			}
		});

		if(isWidthSame)
		{
			arrow_path = "M 0 -7 L 0 7 M 0 0 L " + active_obj.width + " 0 M 0 0 L 5 -3 M 0 0 L 5 3 M " + active_obj.width + " 0 L " + (active_obj.width - 5) + " -3 M " + active_obj.width + " 0 L " + (active_obj.width - 5) + " 3 M " + active_obj.width + " -7 L " + active_obj.width + " 7 z";

			self._f_canvas.add(new fabric.Path(arrow_path, 
			{
				left 		: active_obj.left - active_obj.width / 2,
				top 		: active_obj.top + active_obj.height + 10,
				stroke 		: '#5ac85a',
				strokeWidth : 1,
				fill 		: false,
				class 		: "guide_line"					
			}));
		}

		if(isHghtSame)
		{
			arrow_path = "M 0 -7 L 0 7 M 0 0 L " + active_obj.height + " 0 M 0 0 L 5 -3 M 0 0 L 5 3 M " + active_obj.height + " 0 L " + (active_obj.height - 5) + " -3 M " + active_obj.height + " 0 L " + (active_obj.height - 5) + " 3 M " + active_obj.height + " -7 L " + active_obj.height + " 7 z";

			self._f_canvas.add(new fabric.Path(arrow_path, 
			{
				left 		: active_obj.left - active_obj.height / 2 + active_obj.width + 25,
				top 		: active_obj.top,
				stroke 		: '#5ac85a',
				strokeWidth : 1,
				fill 		: false,
				angle 		: 90,
				class 		: "guide_line"					
			}));

			isHghtSame = 1;
		}
	}

	self.array_obj_sort 				= function(obj_arr, drag_obj, mode)
	{
		var tmp_obj;
		var min_ind  	= obj_arr.length;
		var min_top  	= 99999;
		var min_left 	= 99999;

		for(var i = 0; i < obj_arr.length; i ++)
		{
			if(mode == "virtical")
			{
				for(var j = i + 1; j < obj_arr.length; j ++)
				{
					if(obj_arr[j].top < obj_arr[i].top)
					{
						tmp_obj 	= obj_arr[i];
						obj_arr[i] 	= obj_arr[j];
						obj_arr[j] 	= tmp_obj;
					}
				}

				if(obj_arr[i].top >= drag_obj.top)
				{
					if(min_top >  obj_arr[i].top)
					{
						min_top  = obj_arr[i].top;
						min_ind  = i;
					}
				}
			}

			if(mode == "horizontal")
			{
				for(var j = i + 1; j < obj_arr.length; j ++)
				{
					if(obj_arr[j].left < obj_arr[i].left)
					{
						tmp_obj 	= obj_arr[i];
						obj_arr[i] 	= obj_arr[j];
						obj_arr[j] 	= tmp_obj;
					}
				}

				if(obj_arr[i].left >= drag_obj.left)
				{
					if(min_left >  obj_arr[i].left)
					{
						min_left  = obj_arr[i].left;
						min_ind   = i;
					}
				}
			}
		}

		return {"arr" : obj_arr, "min_ind" : min_ind};
	}

	self.getDistance						= function(obj1, obj2, mode)
	{
		var dist  = 0;
		var dist1 = 0;
		var dist2 = 0;

		if(mode == "virtical")
		{
			dist1 = obj2.top - (obj1.top + obj1.height);
			dist2 = obj1.top - (obj2.top + obj2.height);

			dist = Math.max(dist1,dist2);
		}

		if(mode == "horizontal")
		{
			dist1 = obj2.left - (obj1.left + obj1.width);
			dist2 = obj1.left - (obj2.left + obj2.width);

			dist = Math.max(dist1,dist2);
		}

		return dist;
	}

	self.updateStatus 						= function(evt, mode)
	{
		if(mode == "pos")
		{

			var canv_pos 	= $("#draw-contain").position();
			var ruler_size 	= self.objRuler.rSize;

			var pos_left 	= Math.round((evt.e.clientX - canv_pos.left - 1 - ruler_size) / self.objRuler.unit_px * 100) / 100;
			var pos_top 	= Math.round((evt.e.clientY - canv_pos.top -  1 - ruler_size) / self.objRuler.unit_px * 100) / 100;
			var pos_html 	= pos_left + "," + pos_top;

			$("#info_pos").html(pos_html);
		}
		else if(mode == "size")
		{
			var active_obj 	= self._f_canvas.getActiveObject();
			var size_html 	= "";

			if(!active_obj)
				active_obj 	= self._f_canvas.getActiveGroup();

			if(!active_obj)
				size_html 	= "0 x 0";
			else
				size_html 	= Math.round(active_obj.get('width')) + " x " + Math.round(active_obj.get('height'));

			$("#info_size").html(size_html);
		}
		else if(mode == "angle")
		{
			var active_obj 	= self._f_canvas.getActiveObject();
			var angle_html 	= "";

			if(!active_obj)
				active_obj 	= self._f_canvas.getActiveGroup();

			if(!active_obj)
				angle_html 	= "0&rsquo;";
			else
				angle_html 	= Math.round(active_obj.get('angle')) + "&rsquo;";

			$("#info_angle").html(angle_html);
		}
	}

	self.canvSizeUpdate = function()
	{
		self.pTypeToSize();

		$("#canvas_stage").attr("width", self._width * self._zoom);
		$("#canvas_stage").attr("height", self._height * self._zoom);

		$("#canvas_stage").css("width", self._width * self._zoom);
		$("#canvas_stage").css("height", self._height * self._zoom);

		$("#draw-board").css("width", self._width * self._zoom);
		$("#draw-board").css("height", self._height * self._zoom);

		self._f_canvas.setWidth(self._width * self._zoom);
		self._f_canvas.setHeight(self._height * self._zoom);
		self._f_canvas.renderAll();
		self._f_canvas.calcOffset();
	}

	self.pTypeToSize 	= function()
	{
		var mm 		= $("#chk_unit").width();
		var width 	= 0;
		var height 	= 0;

		switch(self.canvSize)
		{
			case "A3" : 
				self._width 	= 420 * mm;
				self._height 	= 297 * mm;
			break;

			case "A4" : 
				self._width 	= 210 * mm;
				self._height 	= 297 * mm;
			break;

			case "A5" : 
				self._width 	= 210 * mm;
				self._height 	= 148 * mm;
			break;

			case "B5" : 
				self._width 	= 250 * mm;
				self._height 	= 176 * mm;
			break;
		}

		if(self.canvOrient == "Landscape")
		{
			width	= Math.max(self._width, self._height);
			height 	= Math.min(self._width, self._height);

			self._width 	= width;
			self._height 	= height;
		}
		else
		{
			width 	= Math.min(self._width, self._height);
			height 	= Math.max(self._width, self._height);

			self._width 	= width;
			self._height 	= height;
		}
	}

	self.initAutoSave 	= function()
	{
		var box_left 	= ($(window).width() - $("#information_box").width()) / 2;
		var box_top 	= 250;
		var interval 	= 0;

		if(self.autosave == "None")
			return;

		if(self.autoTimer)
		{
			clearInterval(self.autoTimer);
			self.autoTimer = null;
		}

		$("#information_box").children("h3").html("Auto-save will do every " + self.autosave);
		$("#information_box").css({left : box_left, top : box_top});
		$("#information_box").fadeIn(200,function()
		{
			setTimeout(function()
			{
				$("#information_box").fadeOut(200);
			},2000);
		});

		interval = self.autosave.replace(" min", "") * 60 * 1000;

		setInterval(self.doAutoSave, interval);
	}

	self.doAutoSave 	= function()
	{
		var box_left 	= ($(window).width() - $("#information_box").width()) / 2;
		var box_top 	= 250;
		var json 		= self.canvasToJSON();

		localStorage.setItem("autosaved", json);

		$("#information_box").children("h3").html("Successfuly Saved!");
		$("#information_box").css({left : box_left, top : box_top});
		$("#information_box").fadeIn(200,function()
		{
			setTimeout(function()
			{
				$("#information_box").fadeOut(200);
			},2000);
		});
	}

	self.loadSaved  	= function()
	{
		var json = localStorage.getItem("autosaved");
		var data = "";

		data = JSON.parse(json);	
		self.jsonToCanvas(data);
	}

	self.lockCanvas 	= function()
	{
		self._f_canvas.forEachObject(function (obj)
		{
			obj.lockMovementX 	= 1;
			obj.lockMovementY 	= 1;
			obj.lockScalingX 	= 1;
			obj.lockScalingY 	= 1;
			obj.lockRotation 	= 1;
		});

		self._f_canvas.renderAll();
	}

	self.unlockCanvas 	= function()
	{
		self._f_canvas.forEachObject(function (obj)
		{
			obj.lockMovementX 	= 0;
			obj.lockMovementY 	= 0;
			obj.lockScalingX 	= 0;
			obj.lockScalingY 	= 0;
			obj.lockRotation 	= 0;
		});

		self._f_canvas.renderAll();
	}

	self.export 	= function()
	{
		var data 	= self._f_canvas.toDataURL();
		var mm 		= $("#chk_unit").width();

		if(self.export_mode == "JSON")
			data 	= self.canvasToJSON();

		$.ajax(
		{
			type: "POST",
			url: "php/ajax.php", 
			data: ({mode : self.export_mode, data : data, width : self._width / mm, height : self._height / mm, orient : self.canvOrient}),
			cache: false,
			success: function(fileName)
			{
				console.log(fileName);
				window.open("php/download.php?name=" + fileName);
			}
		});
	}
}
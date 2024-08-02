var Fulcra 			= null;
var DragItem 		= null;
var loaded_count 	= 0;
var Component 		= null;
var T_Connectors 	= new Array();

var Shape_count 	= 0;
var dragObj 		= null;
var objDropMenu 	= new class_dropMenu();
var rulerObj		= null;
var layerObj 		= null;
var obj_index 		= 0;

function init_configuration(url){
	$.ajax({
		type: "POST",
		url: url,
		data: ({}),
		cache: false,
		success: function(result) {
			Component = setComponentFromString(result);
			Component.data = new Array();
			loaded_count = 0;
			init_shape_conf();
		},
		
		error: function(result){
			alert("init fail!");
		}
	});
}

function init_shape_conf()
{
	if(loaded_count < Component.length)
	{
		console.log(loaded_count, Component[loaded_count].file);

		$.ajax({
			type: "POST",
			url: Component[loaded_count].file,
			data: ({}),
			cache: false,
			success: function(result) {
console.log(result);
				Component[loaded_count].data = setComponentFromString(result);
				console.log(loaded_count + "  " + Component[loaded_count].file);
				loaded_count ++;
				init_shape_conf();
			},
			
			error: function(result){
				console.log(loaded_count + "  " + Component[loaded_count].file);
				loaded_count ++;
				init_shape_conf();
			}
		});
	}else{
		initShapeMenu(Component);
		initShapeEvent();
		
		var mm 		= $("#chk_unit").width();
		var w 		= 420 * mm;
		var h 		= 297 * mm;

		Fulcra = new CLASS_FULCRA('canvas_stage', w, h);
		Fulcra.canvSizeUpdate();
		Fulcra.objRuler = rulerObj;
		Fulcra.objLayer = layerObj;

		
		layerObj.init(Fulcra);
		objDropMenu.init(Fulcra);
	}
}

function initShapeMenu(obj){
	var html_str = "";
	var parent = document.getElementsByClassName("model-contain")[0];

	for(var key = 0; key < obj.length; key ++){

		var module = obj[key];
		var contain = document.createElement('div');
		contain.id = module.id;

		$(contain).addClass("sub-contain");

		var title = document.createElement('div');
		$(title).addClass("sub-model-title");
		html_str = '<span>' + module.title + '</span><img src=\"images/trans.png\">'
		$(title).html(html_str);
		
		var content = document.createElement('div');
		$(content).addClass("sub-model-content");
		
		if(typeof module.data != 'undefined'){
			for(var i = 0; i < module.data.length; i ++){
				var shape = document.createElement('div');
				$(shape).addClass("model-item");
				$(shape).attr('title', module.data[i].title);
				
				if( (i % 3) == 2 || i == module.data.length - 1)
					$(shape).addClass("right");
					
				shape.id = module.data[i].id;
				var sub_str = '<img src=\"' + module.data[i].icon + '\"><span>' + module.data[i].title + '</span>';
				$(shape).html(sub_str);
				
				content.appendChild(shape);
				
				Shape_count ++;
			}
			
		}
		contain.appendChild(title);
		contain.appendChild(content);
		parent.appendChild(contain);

		if(contain.id == "sequence")
		{
			$(contain).find(".sub-model-content").css({"display":"none"});
			$(contain).addClass("active");
		}
	}
}

function initShapeEvent(){
	$(".sub-model-content").toggle( );
	
	$(".sub-model-title").click(function(){
		$(".sub-contain.active").find(".sub-model-content").animate({
			height: "toggle"
			}, 500, function() {
		});
		$(".sub-contain.active").removeClass("active");
		if($(this).parent().attr('id') != CurModuleID){
			CurModuleID = $(this).parent().attr('id');
			$(this).parent().addClass("active");
			$(this).parent().find(".sub-model-content").animate({
				height: "toggle"
				}, 500, function() {
			});
		}else{
			CurModuleID = "";
		}
	});
	
	$(".model-item").click(function(){

		$(".item-clicked").removeClass("item-clicked");
		Fulcra.click_line = null;
		
		if(this.id == "AnchorLine" || this.id == "AsyncMessage" || this.id =="InitializeMessage" || this.id == "ReturnMessage" || this.id == "SyncMessage" || this.id == "FoundMessage" || this.id == "LostMessage" )
		{
			$(this).addClass("item-clicked");

			if(Fulcra != null)
			{
				console.log(this.id + ",set");
				Fulcra.click_line = this.id;
			}
		}
	});
	
	$(".model-item").draggable(
	{
		helper 	: "clone",
		start 	: function(event,ui)
		{
			var key1, key2, obj;
			var left,top;
			
			key2 = $(event.target).attr("id");
			
			if(key2 == "draw-content-properties")
				return;

			left 	= (event.offsetX - Fulcra._f_canvas.viewport.position.x - Fulcra._f_canvas.viewport.grabPointer.x + Fulcra._f_canvas.viewport.grabStartPointer.x) / Fulcra._f_canvas.viewport.zoom;
			top  	= (event.offsetY - Fulcra._f_canvas.viewport.position.y - Fulcra._f_canvas.viewport.grabPointer.y + Fulcra._f_canvas.viewport.grabStartPointer.y) / Fulcra._f_canvas.viewport.zoom;
				
			key1 	= $(event.target).parent().parent()[0].id;
			obj 	= getClassNamefromKey(key1, key2);

			dragObj = Fulcra.drawComponent(obj.class, obj.model, left, top, key1, key2);
			dragObj.key1 	= key1;
			dragObj.key2 	= key2;
			dragObj.ind 	= obj_index;

			Fulcra._f_canvas.setActiveObject(dragObj.shape);
			Fulcra.objArr.push(dragObj);
			Fulcra.dragObj 	= dragObj;
			Fulcra.isDrag 	= 1;

			layerObj.addLayer(key2, dragObj, obj_index);
			obj_index ++;
		},

		drag: function(event)
		{
			
		},

		stop: function()
		{
			var json = "";

			Fulcra.clearGuideLines();
			Fulcra.dragObj 	= null;
			Fulcra.isDrag 	= 0;
			Fulcra.recAction();
		}
	});
	
	$("#canvas_stage").droppable({
		drop: function(event, ui)
		{
			// Fulcra.dragObj.fireEvent("update", { 'target': Fulcra.dragObj });
			// Fulcra._f_canvas.renderAll();
			return;
		}
	});
}

function getClassNamefromKey(key1, key2){
	var parent, obj;

	for(var i = 0; i < Component.length; i ++){
		parent = Component[i];
		if(parent.id == key1){
			for(var j = 0; j < parent.data.length; j ++){
				obj = parent.data[j];
				if(obj.id == key2){
					return obj;
				}
			}
		}
	}
	return null;
}

function setWindowSize(){
	
	var width = window.innerWidth - 275;
	$(".draw-container").css({width: width + 'px'});

	var offset = getOffset($("#draw-contain")[0]);
	var height = window.innerHeight - (offset.top + 1) - 46;
	var left_width = width - 225;

	$("#draw-contain").css({height: height + 'px'});
	$("#footer_left").css({width:left_width + 'px'});
	
	offset = getOffset($("#object-bar")[0]);
	height = window.innerHeight - (offset.top + 1);
	$("#object-bar").css({height: height + 'px'});

	init_ctrls();
}

window.onresize = setWindowSize;
window.onload = function(){
	init_configuration("./conf/conf.txt");
	setWindowSize();
};
var myProgressBar, timerId;

function init_ctrls()
{
	var width = $(window).width() - 90;
	var tmp_w = 0;

	$("#contrl-area ul").find("li").each(function()
	{
		tmp_w += $(this).width() + 10;

		$(this).css({"clear" : ""});

		if(tmp_w > width)
		{
			tmp_w = 0;
			$(this).css({"clear" : "both"});
		}
	});
}

function loadProgressBar(){
	myProgressBar = new ProgressBar("my_progress_bar_1",{
		borderRadius: 10,
		width: 600,
		height: 30,
		maxValue: 100,
		labelText: "",
		orientation: ProgressBar.Orientation.Horizontal,
		direction: ProgressBar.Direction.LeftToRight,
		animationStyle: ProgressBar.AnimationStyle.LeftToRight1,
		animationSpeed: 2,
		imageUrl: 'images/v_fg12.png',
		backgroundUrl: 'images/h_bg2.png',
		markerUrl: 'images/marker2.png'
	});
	
	$("#loading_Text").text("waiting...");
	timerId = window.setInterval(function() {
		if( Component == null )
			return;
			
		if(loaded_count == Component.length){
			if( Component.length == 0 )
				myProgressBar.setValue( 0 );
			else{
				if(Shape_count != 0 && Fulcra != null){
					if( Shape_count == Fulcra._loaded_count ){
						$("#progress_div").hide();
						$("#wait-back").hide();
						window.clearInterval(timerId);
						return;
					}else{
						myProgressBar.setValue(parseInt((Fulcra._loaded_count / Shape_count) * 100));
						$("#loading_Text").text("Shapes(" + Fulcra._loaded_count + "/" + Shape_count + ")");
					}
				}
			}
		}else{
			myProgressBar.setValue(parseInt((loaded_count / Component.length) * 100));
			$("#loading_Text").text("Configuration(" + loaded_count + "/" + Component.length + ")");
		}
		/*
		if ( SpinGame._totoal == SpinGame._current ){
			myProgressBar.setValue(0);
			$("#progress_div").hide();
			$("#wait-back").hide();
			window.clearInterval(timerId);
		}
		else{
			myProgressBar.setValue(parseInt((SpinGame._current / SpinGame._totoal) * 100));
		}*/
	},
	50);
	
}

function initSlider()
{
	var sliderVal = 4;
	
	var slider = $("#slider_body").slider({
		min		: 1,
		max		: 10,
		value	: sliderVal,
		change	: function(event, ui)
		{
			Fulcra._zoom = 1 + (ui.value - 4) * 0.25;
			Fulcra._f_canvas.setZoom(1 + (ui.value - 4) * 0.25);
			Fulcra.canvSizeUpdate();

			rulerObj.zoom = Fulcra._zoom;
			rulerObj.sizeRuler();
			rulerObj.drawRulerH();
			rulerObj.drawRulerV();
		}
	});

	$("#slider_inc").click(function()
	{
		sliderVal = Math.min(sliderVal * 1 + 1, 15);
		slider.slider("value",sliderVal);
	});
	
	$("#slider_dec").click(function()
	{
		sliderVal = Math.max(sliderVal * 1 - 1, 1);
		slider.slider("value",sliderVal);
	});
};

function initRuler()
{
	rulerObj = new RulerObj();
	rulerObj.init();
}

jQuery(document).ready(function($)
{
	loadProgressBar();
	initSlider();
	initRuler();

	layerObj = new LayerObj();

	$(".menu-contents").toggle();
	$('#properties-controls .content .line-point .selected img').click(function(){
		$(this).parent().parent().find('.menu-contents').toggle();
	});

	$("#properties-controls .content ul li").click(function(){
		$(this).parent().toggle();
		var imgSrc = $(this).find('img').attr("src");
		$(this).parent().parent().find('.selected .shape-icon').attr("src", imgSrc);
		var id = $(this).parent().parent().attr("id");
		var arg = $(this).find("img").attr("id");
		switch(id){
		case 'left-point':
			Fulcra.changeLeftLinePoint( arg );
			break;
		case 'right-point':
			Fulcra.changeRightLinePoint( arg );
			break;
		case 'center-point':
			Fulcra.changeLineType( arg );
			break;
		case 'line-width':
			Fulcra.changeLineWidth( arg );
			break;
		case 'line-style':
			Fulcra.changeLineStyle( arg );
			break;
		}
	});

	$("#draw-contain").on("scroll",function()
	{
		Fulcra._f_canvas.calcOffset();

		$("#ruler_gap").css({"margin-top" : $(this).scrollTop(), "margin-left" : $(this).scrollLeft()});
		$("#canvas_h_ruler").css("margin-top",  $(this).scrollTop());
		$("#canvas_v_ruler").css("margin-left", $(this).scrollLeft());
	});
	
	$('.picker').colpick({
		layout:'hex',
		color:'000',
		onSubmit:function(hsb,hex,rgb,el){
			$(el).find('.displayed-color').css('background-color', '#'+hex);
			$(el).colpickHide();
			switch($(el).attr('id')){
			case 'line-color':
				Fulcra.changeColorforLine('#'+hex);
				break;
			case 'text-color':
				Fulcra.changeFontColorforText('#'+hex);
				break;
			}
		}
	});
	
	$("#properties-controls .content .button-type").click(function(){
		var removeFlag = false;
		if($(this).hasClass('text-place')){
			$("#properties-controls .content .text-place").removeClass('active');
			$(this).addClass('active');
		}else if($(this).hasClass('text-decoration')){
			if($(this).hasClass('active')){
				$(this).removeClass('active');
				removeFlag = true;
			}else{
				$("#properties-controls .content .text-decoration").removeClass('active');
				$(this).addClass('active');
				removeFlag = false;
			}
		}else{
			if(!$(this).hasClass('active')){
				$(this).addClass('active');
				removeFlag = false;
			}
			else{
				$(this).removeClass('active');
				removeFlag = true;
			}
		}
		
		switch($(this).attr('id')){
		case 'text-bold':
			Fulcra.changeBoldforLineText(removeFlag);
			break;
		case 'text-italic':
			Fulcra.changeItalicforLineText(removeFlag);
			break;
		case 'text-center':
			Fulcra.changeDecorationforText('line-through', removeFlag);
			break;
		case 'text-underline':
			Fulcra.changeDecorationforText('underline', removeFlag);
			break;
		case 'text-align-left':
			Fulcra.changeAlignforText('left', removeFlag);
			break;
		case 'text-align-center':
			Fulcra.changeAlignforText('center', removeFlag);
			break;
		case 'text-align-right':
			Fulcra.changeAlignforText('right', removeFlag);
			break;
		}
	});
	
	$('#properties-controls .content #text-fontfamily').change(function() {
		var val = $("#properties-controls .content #text-fontfamily option:selected").text();
		Fulcra.changeFontforText(val);
	});
	$('#properties-controls .content #text-fontsize').change(function() {
		var val = $("#properties-controls .content #text-fontsize option:selected").text();
		Fulcra.changeFontSizeforText(parseInt(val));
	});
	
	$("#properties-button .item").click(function(){
		$("#properties-button").hide();
		$("#properties-controls").show();
		
		$("#properties-controls .tab .tab-title").removeClass("active");
		$("#properties-controls .tab .content").removeClass("active");
		
		switch($(this).attr('id')){
		case 'button-line':
			$("#properties-controls #line-tab .tab-title").addClass("active");
			$("#properties-controls #line-tab .content").addClass("active");
			break;
		case 'button-text':
			$("#properties-controls #text-tab .tab-title").addClass("active");
			$("#properties-controls #text-tab .content").addClass("active");
			break;
		case 'button-shape':
			$("#properties-controls #text-tab .tab-title").addClass("active");
			$("#properties-controls #shape-tab .content").addClass("active");
			break;
		}
	});
	
	$("#properties-controls .tab .tab-title").click(function(){
		$("#properties-controls .tab .tab-title").removeClass("active");
		$("#properties-controls .tab .content").removeClass("active");
		$(this).addClass("active");
		$(this).parent().find('.content').addClass("active");
	});
	
	$("#draw-content-properties").draggable();
	$("#draw-content-properties").hide();

	$(document).click(function()
	{
		objDropMenu.hideMenu();
	});
});

var LayerObj 		= function()
{
	var main	 	= this;
	var layerList 	= [];
	var layerIndex 	= 0;
	var groupIndex 	= 1;
	var fulcraObj 	= null;

	main.init 		= function(fulcra)
	{
		main.initEvent();
		main.fulcraObj = fulcra;
	}

	main.initEvent 	= function()
	{
		$(".right_content").on("click", ".layer-entry", function()
		{
			var index = $(this).attr("index");

			main.fulcraObj._f_canvas.setActiveObject(layerList[index].obj.shape);
		});

		$(".right_content").on("click", ".ctrl-view", function()
		{
			var index = $(this).parents('.layer-entry').attr("index");

			layerList[index].obj.shape.visible = false;
			layerList[index].obj.fireEvent("Hide");

			$(this).addClass("ctrl-hide");
			$(this).removeClass("ctrl-view");
			$(this).html('<p class="blank">&nbsp;</p>');
		});

		$(".right_content").on("click", ".ctrl-hide", function()
		{
			var index = $(this).parents('.layer-entry').attr("index");

			layerList[index].obj.shape.visible = true;
			layerList[index].obj.fireEvent("Show");

			$(this).addClass("ctrl-view");
			$(this).removeClass("ctrl-hide");
			$(this).html('');
		});

		$(".right_content").on("click", ".layer-group", function()
		{
			if($(this).parents(".list-group").hasClass("expand"))
			{
				$(this).parents(".list-group").removeClass("expand");
				$(this).parents(".list-group").addClass("collapse");
			}
			else
			{
				$(this).parents(".list-group").removeClass("collapse");
				$(this).parents(".list-group").addClass("expand");
			}
		});

		
	}

	main.addLayer 	= function(name, obj, index)
	{
		var html 	= "";

		html += '<li><ul class="layer-entry">';
		html += '<li class="ctrl-view"><!--img src="images/new_theme/layer_icon_view.png"--></li>';
		html += '<li class="layer-elem">' + name + '</li></ul></li>';

		$("#section_layers .right_content").append(html);
		$("#section_layers .active").removeClass("active");
		$("#section_layers .right_content").children("li:last").addClass("active");
		$("#section_layers .right_content").children("li:last").children(".layer-entry").attr("index", index);

		layerList[index] = {name : name, obj : obj, menu : $("#section_layers .right_content").children("li:last")};
	}

	main.addGroup 	= function(idArr)
	{
		var html 	= "";
		var index 	= -1;

		if(!idArr.length)
			return;

		html += '<li>';
		html += '<ul class="list-group expand">';
		
		html += '<li><ul class="group-entry">';
		html += '<li><img src="images/new_theme/layer_icon_view.png"></li>';
		html += '<li class="layer-group">Group ' + groupIndex + '</li></ul></li>';
		html += '</ul></li>';

		$("#section_layers .right_content").append(html);

		for(var i = 0; i < idArr.length; i ++)
		{
			layerList[idArr[i]].menu.appendTo($("#section_layers .right_content").children("li:last").children(".list-group"));
		}

		groupIndex ++;
	}

	main.delGroup 	= function(idArr, shapeArr)
	{
		var groupObj = null;

		for(var i = 0; i < idArr.length; i ++)
		{
			groupObj = layerList[idArr[i]].menu.parents(".list-group").parent();
			
			layerList[idArr[i]].menu.appendTo($("#section_layers .right_content"));
			layerList[idArr[i]].obj = shapeArr[i];
		}

		groupObj.remove();
	}

	main.selObject 	= function(index)
	{
		if(!layerList[index])
			return;

		$("#section_layers .active").removeClass("active");
		layerList[index].menu.addClass("active");
	}

	main.in_array 	= function(index, idArr)
	{
		for(var i = 0; i < idArr.length; i ++)
		{
			if(index == idArr[i])
				return 1;
		}

		return 0;
	}
}
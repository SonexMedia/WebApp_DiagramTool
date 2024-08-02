var class_dropMenu 	= function()
{
	var main 		= this;

	main.fulcra 	= null;
	main.dropArr 	= [];

	main.init 		= function(fulcra)
	{
		main.fulcra = fulcra;
		main.initData();
		main.initEvent();
	}

	main.initData 	= function()
	{
		main.dropArr = {"file" : 	[
										{"title" : "New" },
										{"title" : "Save" },
										{"title" : "Export", "subArr" : ["JSON", "Image", "PDF"] },
										{"title" : "Load", "subArr" : ["From File", "From Auto-saved"]},
										{"title" : "Lock / Unlock", "subArr" : ["Lock", "Unlock"]},
										{"title" : "Auto Save", "subArr" : ["None", "5 min", "10 min", "20 min", "30 min", "60 min"]},
										{"title" : "Ruler Unit", "subArr" : ["Millimeter", "Centimeter", "Meter", "Kilometer", "Inch", "Foot", "Miles", "Point", "Pica"]},
										{"title" : "Canvas Size", "subArr" : ["A3","A4","A5","B5"]},
										{"title" : "Document Orientation", "subArr" : ["Landscape","Potrait"]},
									]
						}
	}

	main.initEvent	= function()
	{
		$(".menu-bar li").click(function(evt)
		{
			var index 	= $(this).index();
			var left 	= $(this).offset().left;

			main.hideMenu();

			switch(index)
			{
				case 0 : 
					main.showMenu(left, "file");
				break;
			}

			evt.stopPropagation();
		});

		$("#dropdown_list").on("mouseover", ".expand_h3", function()
		{
			$(".sub_expand").css("display","none");
			$(".sub_expand").removeClass("sub_expand");

			$(this).parent().children(".sub_menu").fadeIn();
			$(this).parent().children(".sub_menu").addClass("sub_expand");
		});

		$("#dropdown_list").on("click", "h3", function(evt)
		{
			var mm 		= $("#chk_unit").width();
			var width 	= mm * 0;
			var height 	= mm * 0;

			if($(this).hasClass("expand_h3"))
			{
				evt.stopPropagation();
			}
			else
			{
				$(".select_h3").removeClass("select_h3");

				switch($(this).html())
				{
					case "A3" : 
					case "A4" : 
					case "A5" : 
					case "B5" : 
						
						main.fulcra.canvSize = $(this).html();
						main.fulcra.canvSizeUpdate();

						$(this).addClass("select_h3");
					break;

					case "Landscape" :
					case "Potrait" :
						main.fulcra.canvOrient = $(this).html();
						main.fulcra.canvSizeUpdate();

						$(this).addClass("select_h3");
					break;

					case "Millimeter" :
					case "Centimeter" :
					case "Meter" :
					case "Kilometer" :
					case "Inch" :
					case "Foot" :
					case "Miles" :
					case "Point" :
					case "Pica" :
						main.fulcra.unit = $(this).html();
						$(this).addClass("select_h3");
					break;

					case "None" :
					case "5 min" :
					case "10 min" :
					case "20 min" :
					case "30 min" :
					case "60 min" :
						main.fulcra.autosave = $(this).html();
						main.fulcra.initAutoSave();

						$(this).addClass("select_h3");
					break;

					case "From Auto-saved" :
						main.fulcra.loadSaved();
					break;

					case "Lock" : 
						main.fulcra.isLock = "Lock";
						main.fulcra.lockCanvas();
					break;

					case "Unlock" : 
						main.fulcra.isLock = "Unlock";
						main.fulcra.unlockCanvas();
					break;

					case "JSON" : 
					case "Image" :
					case "PDF" :
						main.fulcra.export_mode = $(this).html();
						main.fulcra.export();
					break;

				}
			}
		});
	}

	main.setMenu 	= function(menuID)
	{
		var dropMenu 	= main.dropArr[menuID];
		var html 		= "<ul>";

		for(var i = 0; i < dropMenu.length; i++)
		{
			html += '<li>';
			
			if(dropMenu[i].subArr)
			{
				html += '<h3 class="expand_h3">' + dropMenu[i].title + '</h3>';
				html += '<ul class="sub_menu">';

				for (var j = 0; j < dropMenu[i].subArr.length; j++)
				{
					if( (main.fulcra.canvSize 	== dropMenu[i].subArr[j]) || 
						(main.fulcra.canvOrient	== dropMenu[i].subArr[j]) || 
						(main.fulcra.unit		== dropMenu[i].subArr[j]) ||
						(main.fulcra.autosave	== dropMenu[i].subArr[j]) || 
						(main.fulcra.isLock		== dropMenu[i].subArr[j]))
						html += '<li><h3 class="select_h3">' + dropMenu[i].subArr[j] + '</h3></li>';
					else
						html += '<li><h3>' + dropMenu[i].subArr[j] + '</h5></li>';
				}

				html += '</ul>';
			}
			else
			{
				html += '<h3>' + dropMenu[i].title + '</h3>';
			}

			html += '</li>';
		}

		html += "</ul>";

		$("#dropdown_list").html(html);
	}

	main.showMenu 		= function(left, menuID)
	{
		main.setMenu(menuID);

		$("#dropdown_list").css("left",left);
		$("#dropdown_list").fadeIn();
	}

	main.hideMenu 		= function()
	{
		$("#dropdown_list").fadeOut();
	}
}
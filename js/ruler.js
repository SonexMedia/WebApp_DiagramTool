var RulerObj 		= function()
{
	var main	 	= this;

	main.cWidth 	= 500;
	main.cHeight 	= 500;

	main.hcanvas 	= null;
	main.hcontext 	= null;

	main.vcanvas 	= null;
	main.vcontext 	= null;

	main.unit 		= "Millimeter";
	main.zoom 		= 1;
	main.rSize 		= 14;
	main.unit_px 	= 0;

	main.lineL_h	= 14;
	main.lineM_h 	= 7;
	main.lineS_h 	= 3;

	main.init 		= function()
	{
		main.initCanvas();
		main.drawRulerH();
		main.drawRulerV();
	}

	main.initCanvas	= function()
	{
		main.sizeRuler();

		main.hcanvas 	= document.getElementById("canvas_h_ruler");
		main.hcontext 	= main.hcanvas.getContext('2d');

		main.vcanvas 	= document.getElementById("canvas_v_ruler");
		main.vcontext 	= main.vcanvas.getContext('2d');
	}

	main.sizeRuler 	= function()
	{
		var mm 		= $("#chk_unit").width() * main.zoom;
		
		main.cWidth  = Math.max(420 * mm, $(window).width() - 270);
		main.cHeight = Math.max(297 * mm, $("#draw-contain").height());
		main.unit_px = mm;

		$("#ruler_gap").css("width",  main.rSize);
		$("#ruler_gap").css("height", main.rSize);

		$("#canvas_h_ruler").css("width", 	main.cWidth);
		$("#canvas_h_ruler").css("height",	main.rSize);
		$("#canvas_h_ruler").attr("width", 	main.cWidth);
		$("#canvas_h_ruler").attr("height", main.rSize);

		$("#canvas_v_ruler").css("width", 	main.rSize);
		$("#canvas_v_ruler").css("height",	main.cHeight);
		$("#canvas_v_ruler").attr("width", 	main.rSize);
		$("#canvas_v_ruler").attr("height", main.cHeight);
	}

	main.drawRulerH	= function()
	{
		var mm 		= $("#chk_unit").width();
		var dist 	= mm * main.zoom;
		var text 	= "";
		var multi 	= 1;

		main.hcontext.translate(0.5, 0.5);
		main.hcontext.clearRect(-2, -2, main.cWidth + 2, main.rSize + 2);

		if(mm * main.zoom < 3)
		{
			multi 	= Math.ceil(1 / main.zoom);
			dist 	= mm * multi;
		}

		for(var i = 0; i < Math.ceil(main.cWidth / dist); i ++)
		{
			var x 	 = i * dist + main.rSize;
			var y 	 = 0;

			main.hcontext.beginPath();
			main.hcontext.font = "9px arial";
			main.hcontext.lineWidth = 1;

			if(i % 20 == 0)
			{
				y 	 = main.rSize - main.lineL_h;
				text = i * multi * multi;

				main.hcontext.fillText(text, x + 2, y + 6);
			}
			else if(i % 10 == 0)
			{
				y = main.rSize - main.lineM_h;
			}
			else
			{
				y = main.rSize - main.lineS_h;
			}

			main.hcontext.moveTo(x, main.rSize);
		    main.hcontext.lineTo(x, y);
		    main.hcontext.closePath();
		    main.hcontext.stroke();
		}
	}

	main.drawRulerV	= function()
	{
		var mm 		= $("#chk_unit").width();
		var dist 	= mm * main.zoom;
		var text 	= "";
		var multi 	= 1;

		main.vcontext.translate(0.5, 0.5);
		main.vcontext.clearRect(-2, -2, main.rSize + 2, main.cHeight + 2);

		if(mm * main.zoom < 3)
		{
			multi 	= Math.ceil(1 / main.zoom);
			dist 	= mm * multi;
		}

		for(var i = 0; i < Math.ceil(main.cHeight / dist); i ++)
		{
			var x 	 = main.rSize;
			var y 	 = i * dist;
			var t_w  = 5;

			main.vcontext.beginPath();
			main.vcontext.font = "9px arial";
			main.vcontext.textAlign = "center";
			main.vcontext.lineWidth = 1;

			if(i % 20 == 0)
			{
				x 	 = main.rSize - main.lineL_h;
				text = i * multi * multi;
				t_w  = main.vcontext.measureText(text).width / 2;

				main.vcontext.save();
				main.vcontext.rotate(Math.PI / (-2));

				main.vcontext.fillText(text, y * (-1) - t_w - 2, 8);
				main.vcontext.restore();
			}
			else if(i % 10 == 0)
			{
				x 	= main.rSize - main.lineM_h;
			}
			else
			{
				x 	= main.rSize - main.lineS_h;
			}

			main.vcontext.moveTo(x, y);
		    main.vcontext.lineTo(main.rSize, y);
		    main.vcontext.closePath();
		    main.vcontext.stroke();
		}
	}
}
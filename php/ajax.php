<?php

	require_once("fpdf.php");

	switch ($_REQUEST['mode'])
	{
		case "JSON" :
			$data = $_REQUEST['data'];
			$name = "export-".time().".json";

			$fp = fopen("../tmp/".$name, "w");
			fwrite($fp, $data);
			fclose($fp);

			echo $name;
			break;
		
		case "Image" : 
			$data = $_REQUEST['data'];
			$name = "export-".time().".png";

			$fp = fopen("../tmp/".$name, "w");
			fwrite($fp, base64_decode(str_replace("data:image/png;base64,", "", $data)));
			fclose($fp);

			echo $name;
			break;

		case "PDF" : 
			$orient 	= substr($_REQUEST['orient'], 0, 1);
			$width  	= $_REQUEST['width'];
			$height 	= $_REQUEST['height'];

			$data 		= $_REQUEST['data'];
			$img_name 	= "export-".time().".png";
			$pdf_name 	= "export-".time().".pdf";

			$fp = fopen("../tmp/".$img_name, "w");
			fwrite($fp, base64_decode(str_replace("data:image/png;base64,", "", $data)));
			fclose($fp);

 			$pdf=new FPDF($orient,"mm",array($width,$height));
			$pdf->AddPage();
			$pdf->Image("../tmp/".$img_name,0,0,$width,$height);
			$pdf->Output("../tmp/".$pdf_name);

			unlink("../tmp/".$img_name);

			echo $pdf_name;
			break;
	}
?>
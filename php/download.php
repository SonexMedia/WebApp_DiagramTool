<?php
    $name   = "../tmp/".$_GET['name'];
    $fp 	= fopen($name, "r");
	$data 	= fread($fp, filesize($name));
	
	fclose($fp);
	unlink($name);

    Header ( "Content-Type: application/text" );
    Header ( "Content-Length: ".strlen($data) );
    Header ( "Content-Disposition: attachment; filename=".$_GET['name'] );

    echo $data;
?>
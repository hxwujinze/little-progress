<?php

include( 'simpleDB.php' );

// 连接数据库

$db_conn = array(
	'host' => '121.40.108.60',
	'port' => '3306',
	'user' => 'wangyi',
	'password' => '123456',
	'db_name' => 'runpace'
);
$db = new simpleDB($db_conn['host'].':'.$db_conn['port'], $db_conn['user'], $db_conn['password'], $db_conn['db_name']);
?>

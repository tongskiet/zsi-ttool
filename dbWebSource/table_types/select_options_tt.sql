CREATE TYPE select_options_tt AS TABLE(
select_id	INT	NULL
,code	VARCHAR(30)	NULL
,table_name	VARCHAR(30)	NULL
,text	VARCHAR(500)	NULL
,value	VARCHAR(500)	NULL
,condition_text	VARCHAR(100)	NULL
,order_by	VARCHAR(100)	NULL)
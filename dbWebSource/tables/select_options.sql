CREATE TABLE select_options(
select_id	INT IDENTITY(1,1)	NOT NULL
,code	VARCHAR(30)	NULL
,table_name	VARCHAR(30)	NULL
,text	VARCHAR(500)	NULL
,value	VARCHAR(500)	NULL
,condition_text	VARCHAR(100)	NULL
,order_by	VARCHAR(100)	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
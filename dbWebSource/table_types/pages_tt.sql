CREATE TYPE pages_tt AS TABLE(
page_id	INT	NULL
,page_name	NVARCHAR(200)	NULL
,page_title	NVARCHAR(400)	NULL
,is_public	CHAR(1)	NULL
,master_page_id	INT	NULL)
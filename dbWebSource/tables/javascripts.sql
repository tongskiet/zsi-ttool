CREATE TABLE javascripts(
js_id	INT IDENTITY(1,1)	NOT NULL
,js_name	NVARCHAR(200)	NULL
,page_id	INT	NULL
,js_content	NVARCHAR(MAX)	NULL
,rev_no	INT	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
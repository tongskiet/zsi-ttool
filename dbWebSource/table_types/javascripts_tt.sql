CREATE TYPE javascripts_tt AS TABLE(
js_id	INT IDENTITY(1,1)	NOT NULL
,js_url	NVARCHAR(400)	NULL
,js_content	NVARCHAR(0)	NULL
,rev_no	INT	NOT NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
CREATE TABLE page_templates(
pt_id	INT IDENTITY(1,1)	NOT NULL
,pt_name	NVARCHAR(200)	NULL
,page_id	INT	NULL
,pt_content	NVARCHAR(MAX)	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
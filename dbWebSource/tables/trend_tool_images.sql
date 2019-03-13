CREATE TABLE trend_tool_images(
image_id	INT IDENTITY(1,1)	NOT NULL
,image_name	NVARCHAR(MAX)	NOT NULL
,image_file	IMAGE(2147483647)	NULL
,content_type	NVARCHAR(100)	NULL
,created_by	INT	NULL
,created_date	DATE	NULL
,updated_by	INT	NULL
,updated_date	DATE	NULL)
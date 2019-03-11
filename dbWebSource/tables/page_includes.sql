CREATE TABLE page_includes(
page_include_id	INT IDENTITY(1,1)	NOT NULL
,page_id	INT	NOT NULL
,storage_location	CHAR(1)	NULL
,library_name	VARCHAR(50)	NULL
,content_type	CHAR(5)	NULL
,created_by	INT	NULL
,created_date	DATE	NULL
,updated_by	INT	NULL
,updated_date	DATE	NULL)
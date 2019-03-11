CREATE TYPE page_includes_tt AS TABLE(
page_include_id	INT	NULL
,page_id	INT	NULL
,is_edited	CHAR(1)	NULL
,storage_location	CHAR(1)	NULL
,library_name	NVARCHAR(200)	NULL)
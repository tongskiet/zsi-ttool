CREATE TABLE role_pages(
role_page_id	INT	NOT NULL
,role_id	INT	NULL
,page_id	INT	NULL
,is_write	VARCHAR(1)	NULL
,is_delete	VARCHAR(1)	NULL
,created_by	INT	NULL
,created_date	DATETIMEOFFSET	NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL)
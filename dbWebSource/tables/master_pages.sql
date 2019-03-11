CREATE TABLE master_pages(
master_page_id	INT IDENTITY(1,1)	NOT NULL
,master_page_name	VARCHAR(50)	NULL
,created_by	INT	NOT NULL
,created_date	DATETIMEOFFSET	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL)
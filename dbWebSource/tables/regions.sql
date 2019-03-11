CREATE TABLE regions(
region_id	INT	NOT NULL
,is_active	VARCHAR(1)	NOT NULL
,region_name	NVARCHAR(200)	NOT NULL
,region_code	NVARCHAR(40)	NOT NULL
,created_by	INT	NOT NULL
,created_date	DATETIMEOFFSET	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL)
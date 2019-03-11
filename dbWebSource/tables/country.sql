CREATE TABLE country(
created_by	INT	NULL
,created_date	DATETIMEOFFSET	NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL
,country_id	INT	NOT NULL
,region_id	INT	NULL
,country_name	NVARCHAR(200)	NOT NULL
,country_code	NVARCHAR(40)	NULL
,is_active	VARCHAR(1)	NULL)
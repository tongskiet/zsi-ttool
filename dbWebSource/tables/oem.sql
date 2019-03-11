CREATE TABLE oem(
oem_id	INT	NOT NULL
,oem_name	NVARCHAR(510)	NOT NULL
,oem_sname	NVARCHAR(200)	NOT NULL
,img_filename	NVARCHAR(150)	NULL
,is_active	VARCHAR(1)	NOT NULL
,created_by	INT	NOT NULL
,created_date	DATETIMEOFFSET	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL)
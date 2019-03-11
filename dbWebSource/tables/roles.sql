CREATE TABLE roles(
created_by	INT	NULL
,created_date	DATETIMEOFFSET	NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL
,role_id	INT IDENTITY(1,1)	NOT NULL
,role_name	NVARCHAR(80)	NOT NULL
,is_export_excel	VARCHAR(1)	NULL
,is_export_pdf	VARCHAR(1)	NULL
,is_import_excel	VARCHAR(1)	NULL
,is_add	CHAR(1)	NULL
,is_edit	CHAR(1)	NULL
,is_delete	CHAR(1)	NULL)
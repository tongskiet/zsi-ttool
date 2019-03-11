CREATE TABLE role_dashboards(
role_dashboard_id	INT IDENTITY(1,1)	NOT NULL
,role_id	INT	NULL
,page_id	INT	NULL
,seq_no	INT	NULL
,created_by	INT	NULL
,created_date	DATETIMEOFFSET	NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL)
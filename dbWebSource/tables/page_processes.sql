CREATE TABLE page_processes(
page_process_id	INT IDENTITY(1,1)	NOT NULL
,page_id	INT	NOT NULL
,seq_no	INT	NOT NULL
,process_desc	VARCHAR(100)	NOT NULL
,role_id	INT	NOT NULL
,is_active	CHAR(1)	NOT NULL
,is_default	CHAR(1)	NULL
,created_by	INT	NOT NULL
,created_date	DATETIME	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
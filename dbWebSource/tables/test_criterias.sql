CREATE TABLE test_criterias(
criteria_id	INT IDENTITY(1,1)	NOT NULL
,criteria_title	VARCHAR(300)	NULL
,pcriteria_id	INT	NULL
,seq_no	INT	NULL
,is_active	CHAR(1)	NULL
,trend_menu_id	INT	NULL
,chart_type	NVARCHAR(200)	NULL
,option_id	INT	NULL
,proc_name	NVARCHAR(200)	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
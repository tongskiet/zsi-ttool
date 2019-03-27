CREATE TABLE criterias(
criteria_id	INT IDENTITY(1,1)	NOT NULL
,criteria_title	VARCHAR(1000)	NULL
,pcriteria_id	INT	NULL
,seq_no	INT	NULL
,is_active	CHAR(1)	NULL
,trend_menu_id	INT	NULL
,chart_type	NVARCHAR(200)	NULL
,proc_name	NVARCHAR(200)	NULL
,image1_id	INT	NULL
,image2_id	INT	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL
,image_by	INT	NULL
,image_date	DATETIME	NULL)
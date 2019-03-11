CREATE TABLE test_trend_menus(
menu_id	INT IDENTITY(1,1)	NOT NULL
,menu_name	NCHAR(20)	NULL
,image_name	NVARCHAR(100)	NULL
,icon_name	NVARCHAR(100)	NULL
,menu_type	NCHAR(20)	NULL
,seq_no	INT	NULL
,specs_id	INT	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
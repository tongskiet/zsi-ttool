CREATE TABLE trend_menus(
menu_id	INT IDENTITY(1,1)	NOT NULL
,menu_name	VARCHAR(50)	NULL
,image1_id	INT	NULL
,image2_id	INT	NULL
,image3_id	INT	NULL
,image4_id	INT	NULL
,fa_icon	NVARCHAR(100)	NULL
,menu_type	NCHAR(20)	NULL
,seq_no	INT	NULL
,specs_id	INT	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL
,image_by	INT	NULL
,image_date	DATETIME	NULL)
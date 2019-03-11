CREATE TABLE role_menus(
role_menu_id	INT IDENTITY(1,1)	NOT NULL
,role_id	INT	NOT NULL
,menu_id	INT	NOT NULL
,is_write	NVARCHAR(4)	NULL
,is_delete	NVARCHAR(4)	NULL
,created_by	INT	NOT NULL
,created_date	DATETIMEOFFSET	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL
,is_new	VARCHAR(1)	NULL)
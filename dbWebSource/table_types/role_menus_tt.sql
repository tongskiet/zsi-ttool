CREATE TYPE role_menus_tt AS TABLE(
role_menu_id	INT	NULL
,role_id	INT	NULL
,menu_id	INT	NULL
,is_new	NVARCHAR(4)	NULL
,is_write	NVARCHAR(4)	NULL
,is_delete	NVARCHAR(4)	NULL)
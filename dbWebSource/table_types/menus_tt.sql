CREATE TYPE menus_tt AS TABLE(
menu_id	INT	NULL
,pmenu_id	INT	NULL
,menu_name	NVARCHAR(400)	NULL
,page_id	INT	NULL
,parameters	NVARCHAR(400)	NULL
,seq_no	INT	NULL
,is_default	NVARCHAR(4)	NULL)
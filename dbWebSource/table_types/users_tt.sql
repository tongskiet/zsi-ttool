CREATE TYPE users_tt AS TABLE(
user_id	INT	NULL
,is_edited	CHAR(1)	NULL
,role_id	INT	NULL
,password	NVARCHAR(800)	NULL)
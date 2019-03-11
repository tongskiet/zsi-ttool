CREATE TABLE sql_commands(
sqlcmd_id	INT IDENTITY(1,1)	NOT NULL
,sqlcmd_code	VARCHAR(50)	NULL
,sqlcmd_text	NVARCHAR(MAX)	NOT NULL
,is_procedure	CHAR(1)	NOT NULL
,is_public	CHAR(1)	NOT NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
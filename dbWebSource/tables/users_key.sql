CREATE TABLE users_key(
id	INT IDENTITY(1,1)	NOT NULL
,user_id	int	NOT NULL
,password	VARCHAR(max)	NOT NULL
,created_by	VARCHAR(100)	NULL
,created_date	DATETIME	NULL
,updated_by	NVARCHAR(200)	NULL
,updated_date	DATETIME	NULL)
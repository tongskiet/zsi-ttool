CREATE TABLE positions(
position_id	INT IDENTITY(1,1)	NOT NULL
,position_code	NVARCHAR(40)	NOT NULL
,position	NVARCHAR(2000)	NOT NULL
,is_active	NCHAR(4)	NOT NULL
,created_by	INT	NOT NULL
,created_date	DATETIME	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
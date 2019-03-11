CREATE TABLE sysdiagrams(
name	SYSNAME(256)	NOT NULL
,principal_id	INT	NOT NULL
,diagram_id	INT IDENTITY(1,1)	NOT NULL
,version	INT	NULL
,definition	IMAGE(2147483647)	NULL)
CREATE TABLE criteria_columns(
criteria_column_id	INT IDENTITY(1,1)	NOT NULL
,criteria_id	INT	NULL
,column_name	NVARCHAR(100)	NULL
,operator_value	NVARCHAR(100)	NULL
,is_output	CHAR(1)	NULL
,column_value	NVARCHAR(100)	NULL
,column_value2	NVARCHAR(100)	NULL
,column_value3	NVARCHAR(100)	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
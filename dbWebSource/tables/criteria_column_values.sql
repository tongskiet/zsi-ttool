CREATE TABLE criteria_column_values(
criteria_column_value_id	INT IDENTITY(1,1)	NOT NULL
,criteria_column_id	INT	NULL
,attribute_value	VARCHAR(100)	NULL
,created_by	INT	NULL
,created_date	DATETIME	NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL)
CREATE TYPE criteria_columns_tt AS TABLE(
criteria_column_id	INT	NULL
,criteria_id	INT	NULL
,is_edited	CHAR(1)	NULL
,column_name	NVARCHAR(100)	NULL
,operator_value	NVARCHAR(40)	NULL
,column_value	NVARCHAR(100)	NULL
,column_value2	NVARCHAR(100)	NULL
,is_output	NVARCHAR(40)	NULL)
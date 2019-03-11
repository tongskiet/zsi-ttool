CREATE TYPE criteria_column_values_tt AS TABLE(
criteria_column_value_id	INT	NULL
,criteria_column_id	INT	NULL
,is_edited	CHAR(1)	NULL
,attribute_value	NVARCHAR(100)	NULL)
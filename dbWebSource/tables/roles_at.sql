CREATE TABLE roles_at(
role_at_id	INT	NOT NULL
,role_id	INT	NOT NULL
,modified_by	INT	NOT NULL
,modified_date	DATETIMEOFFSET	NOT NULL
,data_item	NVARCHAR(1020)	NOT NULL
,old_value	NVARCHAR(1020)	NULL
,new_value	NVARCHAR(1020)	NULL)
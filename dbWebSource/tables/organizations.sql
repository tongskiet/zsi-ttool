CREATE TABLE organizations(
organization_id	INT IDENTITY(1,1)	NOT NULL
,organization_type_id	INT	NULL
,organization_code	NVARCHAR(80)	NOT NULL
,organization_name	NVARCHAR(200)	NULL
,organization_pid	INT	NULL
,organization_head_id	INT	NULL
,is_active	CHAR(1)	NULL
,created_by	INT	NOT NULL
,created_date	DATETIME	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIME	NULL
,organization_address	NVARCHAR(2000)	NULL
,organization_group_id	INT	NULL
,squadron_type_id	INT	NULL)
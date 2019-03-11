CREATE TABLE vehicle_models(
created_by	INT	NOT NULL
,created_date	DATETIMEOFFSET	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL
,vehicle_model_id	INT	NOT NULL
,vehicle_model_name	NVARCHAR(200)	NOT NULL
,is_active	VARCHAR(1)	NOT NULL
,oem_id	INT	NOT NULL
,vehicle_type_id	INT	NULL)
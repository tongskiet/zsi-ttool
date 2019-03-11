CREATE TABLE projects(
project_id	INT	NOT NULL
,vehicle_model_id	INT	NOT NULL
,model_year	INT	NOT NULL
,origin_country_id	INT	NULL
,market_id	INT	NULL
,user_id	INT	NULL
,requested_date	DATETIMEOFFSET	NULL
,status_id	INT	NULL
,is_active	VARCHAR(1)	NULL
,purpose	VARCHAR(MAX)	NULL
,img_filename_thumbnail	VARCHAR(200)	NULL
,img_filename_org	VARCHAR(200)	NULL
,created_by	INT	NOT NULL
,created_date	DATETIMEOFFSET	NOT NULL
,updated_by	INT	NULL
,updated_date	DATETIMEOFFSET	NULL
,is_generated	VARCHAR(1)	NULL
,is_display_db	VARCHAR(1)	NULL
,is_updated	VARCHAR(1)	NULL)
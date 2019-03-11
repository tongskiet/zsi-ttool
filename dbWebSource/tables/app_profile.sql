CREATE TABLE app_profile(
app_title	VARCHAR(100)	NOT NULL
,date_format	VARCHAR(20)	NULL
,excel_conn_str	VARCHAR(100)	NULL
,excel_folder	VARCHAR(100)	NULL
,image_folder	VARCHAR(100)	NULL
,default_page	VARCHAR(100)	NULL
,network_group_folder	VARCHAR(4000)	NULL
,theme_id	INT	NULL
,developer_key	VARCHAR(100)	NULL
,is_source_minified	VARCHAR(1)	NULL)
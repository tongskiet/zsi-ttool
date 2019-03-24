CREATE TYPE wire_gauge_references_tt AS TABLE(
wire_gauge	DECIMAL(10)	NULL
,color_id	INT	NULL
,jaso_lower_limit	DECIMAL(20)	NULL
,jaso_upper_limit	DECIMAL(20)	NULL
,iso_lower_limit	DECIMAL(20)	NULL
,iso_upper_limit	DECIMAL(20)	NULL
,is_edited	CHAR(1)	NULL)
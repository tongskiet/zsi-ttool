CREATE TYPE table_layout_tt AS TABLE(
tableLayoutId	INT	NULL
,Code	VARCHAR(50)	NULL
,url	VARCHAR(50)	NULL
,width	INT	NULL
,height	INT	NULL
,selectorIndex	INT	NULL
,selectorType	VARCHAR(20)	NULL
,blankRowsLimit	INT	NULL
,isPaging	VARCHAR(1)	NULL
,startGroupId	INT	NULL
,tableName	VARCHAR(20)	NULL
,onComplete	VARCHAR(0)	NULL)
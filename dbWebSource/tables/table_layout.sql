CREATE TABLE table_layout(
tableLayoutId	INT IDENTITY(1,1)	NOT NULL
,code	VARCHAR(50)	NULL
,url	VARCHAR(50)	NULL
,width	INT	NULL
,height	INT	NULL
,selectorIndex	INT	NULL
,selectorType	VARCHAR(20)	NULL
,blankRowsLimit	INT	NULL
,isPaging	VARCHAR(1)	NULL
,startGroupId	INT	NULL
,onComplete	VARCHAR(MAX)	NULL
,tableName	VARCHAR(50)	NULL)
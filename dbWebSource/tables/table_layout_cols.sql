CREATE TABLE table_layout_cols(
tableLayoutColId	INT IDENTITY(1,1)	NOT NULL
,tableLayoutId	INT	NULL
,seqNo	INT	NULL
,id	INT	NULL
,groupId	INT	NULL
,text	VARCHAR(50)	NULL
,name	VARCHAR(50)	NULL
,width	INT	NULL
,style	VARCHAR(200)	NULL
,type	VARCHAR(20)	NULL
,isFreeze	VARCHAR(1)	NULL
,sortColNo	INT	NULL
,onRender	VARCHAR(MAX)	NULL
,isIdentity	VARCHAR(1)	NULL
,colDataType	VARCHAR(20)	NULL
,colSize	VARCHAR(20)	NULL
,isNullable	VARCHAR(1)	NULL)
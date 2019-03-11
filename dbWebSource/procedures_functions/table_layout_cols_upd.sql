
CREATE PROCEDURE [dbo].[table_layout_cols_upd]
(
    @tt    table_layout_cols_tt READONLY
   ,@user_id int
)
AS
-- Update Process
	UPDATE a 
		 SET tableLayoutId	= b.tableLayoutId
		    ,id             = b.id
			,groupId        = b.groupId
	 		,text			= b.text
			,name			= b.name
			,width			= b.width
			,style			= b.style
			,type			= b.type
			,isFreeze		= b.isFreeze
			,sortColNo      = b.sortColNo
			,onRender		= b.onRender
			,seqNo          = b.seqNo
			,isIdentity     = b.isIdentity 
			,colDataType    = b.colDataType 
			,colSize        = b.colSize 
			,isNullable     = b.isNullable 
       FROM dbo.table_layout_cols a INNER JOIN @tt b
	     ON a.tableLayoutColId = b.tableLayoutColId 
	    AND 
			(
				isnull(a.tableLayoutId,0) <> isnull(b.tableLayoutId,0)   
			 OR isnull(a.id,0) <> isnull(b.id,0)
			 OR isnull(a.groupId		,0) <> isnull(b.groupId	,0)
			 OR isnull(a.text		,'') <> isnull(b.text		,'')
			 OR isnull(a.name		,'') <> isnull(b.name		,'')
			 OR isnull(a.width		,'') <> isnull(b.width		,'')
			 OR isnull(a.style		,'') <> isnull(b.style		,'')
			 OR isnull(a.type		,'') <> isnull(b.type		,'')
			 OR isnull(a.isFreeze	,'') <> isnull(b.isFreeze	,'')
			 OR isnull(a.sortColNo	,0)  <> isnull(b.sortColNo	,0)
			 OR isnull(a.onRender	,'') <> isnull(b.onRender	,'')
			 OR isnull(a.seqNo	,0)  <> isnull(b.seqNo	,0)
			 OR isnull(a.isIdentity	,'') <> isnull(b.isIdentity	,'')
			 OR isnull(a.colDataType	,'') <> isnull(b.colDataType	,'')
			 OR isnull(a.colSize	,'') <> isnull(b.colSize	,'')
			 OR isnull(a.isNullable	,'') <> isnull(b.isNullable	,'')
			 
			 )

-- Insert Process
	INSERT INTO table_layout_cols (
		 tableLayoutId	
		,id
		,groupId
		,text			
		,name			
		,width			
		,style			
		,type			
		,isFreeze		
		,sortColNo
		,onRender	
		,seqNo	
		,isIdentity 
		,colDataType
		,colSize
		,isNullable 
    )
	SELECT 
		 tableLayoutId	
		,id
		,groupId
		,text			
		,name			
		,width			
		,style			
		,type			
		,isFreeze		
		,sortColNo
		,onRender
		,seqNo	
		,isIdentity 
		,colDataType
		,colSize
		,isNullable 		
	FROM @tt 
	WHERE tableLayoutColId IS NULL
	  AND tableLayoutId IS NOT NULL



	
	
	
	
	
	
	
	
	





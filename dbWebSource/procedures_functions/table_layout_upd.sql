CREATE PROCEDURE [dbo].[table_layout_upd]
(
   @tt    table_layout_tt READONLY
    ,@user_id int
)
AS
-- Update Process
	UPDATE a 
		 SET url			= b.url
	 		,width			= b.width
			,code			= b.code
			,height			= b.height
			,selectorIndex  = b.selectorIndex
			,selectorType	= b.selectorType
			,blankRowsLimit	= b.blankRowsLimit
			,isPaging		= b.isPaging
			,startGroupId   = b.startGroupId
			,onComplete		= b.onComplete
			,tableName      = b.tableName
       FROM dbo.table_layout a INNER JOIN @tt b
	     ON a.tableLayoutId = b.tableLayoutId 
	    AND 
			(
				isnull(a.code			,'') <> isnull(b.code			,'')   
			 OR	isnull(a.url			,'') <> isnull(b.url			,'')   
			 OR isnull(a.width			,0) <> isnull(b.width			,0)
			 OR isnull(a.height			,0) <> isnull(b.height			,0)
			 OR isnull(a.selectorIndex	,0) <> isnull(b.selectorIndex	,0)
			 OR isnull(a.selectorType	,'') <> isnull(b.selectorType	,'')
			 OR isnull(a.blankRowsLimit	,0) <> isnull(b.blankRowsLimit	,0)
			 OR isnull(a.isPaging		,'') <> isnull(b.isPaging		,'')
			 OR isnull(a.startGroupId	,0) <> isnull(b.startGroupId	,0)
			 OR isnull(a.onComplete		,'') <> isnull(b.onComplete		,'')
			 OR isnull(a.tableName		,'') <> isnull(b.tableName		,'')
			)

-- Insert Process
	INSERT INTO table_layout (
	     code
		,url			
		,width			
		,height		
		,selectorIndex	
		,selectorType	
		,blankRowsLimit	
		,startGroupId
		,isPaging		
		,onComplete	
		,tableName	
    )
	SELECT 
	     code
		,url			
		,width			
		,height	
		,selectorIndex		
		,selectorType	
		,blankRowsLimit	
		,startGroupId
		,isPaging		
	    ,onComplete		 
		,tableName
	FROM @tt 
	WHERE tableLayoutId IS NULL









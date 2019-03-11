
CREATE PROCEDURE [dbo].[select_options_upd]
(
   @tt    select_options_tt READONLY
   ,@user_id int
)
AS
-- Update Process
	UPDATE a 
		 SET code           = b.code          
			,table_name		= b.table_name
			,condition_text	= b.condition_text
			,order_by		= b.order_by
			,text			= b.text
			,value			= b.value
	   	    ,updated_by      = @user_id
			,updated_date    = GETDATE()
       FROM dbo.select_options a INNER JOIN @tt b
	     ON a.select_id = b.select_id
	    WHERE (
			    isnull(a.table_name,'') <> isnull(b.table_name,'')
			 OR isnull(a.code,'') <> isnull(b.code,'')
			 OR isnull(a.text,'') <> isnull(b.text,'')
			 OR isnull(a.value,'') <> isnull(b.value,'')
			 OR isnull(a.condition_text,'') <> isnull(b.condition_text,'')
			 OR isnull(a.order_by,'') <> isnull(b.order_by,'')
			)
			
-- Insert Process
	INSERT INTO select_options (
		 code            
		,table_name	 
		,text		 
		,value		 
		,condition_text	 
		,order_by	 
		,created_by
		,created_date
    )
	SELECT 
		 code            
		,table_name	 
		,text		 
		,value		 
		,condition_text	 
		,order_by	 
	    ,@user_id
	    ,GETDATE()
	FROM @tt 
	WHERE select_id IS NULL







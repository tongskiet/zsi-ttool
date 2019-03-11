
CREATE PROCEDURE [dbo].[app_profile_upd](
        @app_title				VARCHAR(100)                      
       ,@date_format			VARCHAR(20)
	   ,@excel_conn_str			VARCHAR(100)
	   ,@excel_folder			VARCHAR(100)
	   ,@image_folder			VARCHAR(100)
	   ,@default_page			VARCHAR(100)
	   ,@network_group_folder	VARCHAR(4000)
	   ,@developer_key			VARCHAR(100)
	   ,@is_source_minified		VARCHAR(1)

)
AS 
BEGIN
    SET NOCOUNT ON 
	update dbo.app_profile 
		set
			 app_title			=	@app_title			
			,date_format		=	@date_format		
			,excel_conn_str	=		@excel_conn_str		
			,excel_folder		=	@excel_folder		
			,image_folder		=	@image_folder
			,default_page		=	@default_page
			,network_group_folder = @network_group_folder	
			,developer_key		  = @developer_key		
			,is_source_minified	  = @is_source_minified

END 

 


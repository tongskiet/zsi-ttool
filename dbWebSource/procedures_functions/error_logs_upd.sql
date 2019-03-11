CREATE PROCEDURE [dbo].[error_logs_upd](
        @error_no	int=null                      
       ,@error_msg	VARCHAR(max)= NULL   
       ,@error_type	VARCHAR(1)= NULL   
	   ,@page_url	VARCHAR(max)= NULL
	   ,@user_id    int = null  

)
AS 
BEGIN
declare @occurence INT,@error_id int=null;

SET NOCOUNT ON 

	select top 1
			 @occurence=occurence 
			,@error_id=error_id 
			from dbo.error_logs 
				where error_msg = @error_msg and page_url=@page_url
	 
	if(@occurence is null)

			INSERT INTO dbo.error_logs( error_no,error_msg,error_type,occurence,page_url,created_by,created_date) 
			VALUES (@error_no, @error_msg,@error_type,1,@page_url,@user_id,GETDATE())
	else 	 
			UPDATE dbo.error_logs 
			SET 
			  error_no=@error_no
			, error_msg=@error_msg 
			, error_type = @error_type
			, occurence=@occurence + 1
			, page_url=@page_url
			, updated_by =  @user_id
			, updated_date = GETDATE()
			where error_id=@error_id
			  
	
END 


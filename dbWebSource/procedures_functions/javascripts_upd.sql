
CREATE PROCEDURE [dbo].[javascripts_upd](
        @js_id		INT =null                      
       ,@page_id	INT	= NULL   
       ,@js_content	VARCHAR(max)= NULL   
	   ,@user_id	INT
	   ,@new_id		INT OUTPUT 

)
AS 
BEGIN
SET NOCOUNT ON 

if ISNULL(@page_id,0)=0 OR ISNULL(@user_id,0)=0 return;
declare @rev_no INT =0 
declare @l_js_id INT;

IF ISNULL(@js_id,0) = 0
   SELECT TOP 1 @l_js_id = js_id
    FROM  dbo.javascripts
	WHERE page_id = @page_id
	ORDER BY js_id;
ELSE
	SET @l_js_id = @js_id;

select @rev_no = ISNULL(rev_no,0)  from javascripts where js_id=@l_js_id

 	if(isnull(@l_js_id,0)=0 )
		begin			
			INSERT INTO dbo.javascripts( page_id,js_content,rev_no,created_by,created_date) 
			VALUES (@page_id, @js_content,1,@user_id,GETDATE())
			set @new_id	=@@identity
		end
	else
		set @new_id=@l_js_id
		begin
			UPDATE dbo.javascripts 
			SET 
			  page_id=@page_id
			, js_content=@js_content 
			, rev_no=@rev_no + 1
			, updated_by =  @user_id
			, updated_date = GETDATE()
			where js_id=@l_js_id
		end	  
	
END 

 



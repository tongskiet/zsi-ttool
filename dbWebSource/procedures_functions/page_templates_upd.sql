
CREATE PROCEDURE [dbo].[page_templates_upd](
        @pt_id		INT =null                      
       ,@page_id	INT	= NULL   
       ,@pt_content	VARCHAR(max)= NULL
	   ,@user_id	INT    
	   ,@new_id		INT OUTPUT 

)
AS 
BEGIN
SET NOCOUNT ON 
	if ISNULL(@page_id,0)=0  OR ISNULL(@user_id,0)=0  return;
	declare @l_pt_id INT;

	IF ISNULL(@pt_id,0) = 0
	   SELECT TOP 1 @l_pt_id = pt_id
		FROM  dbo.page_templates
		WHERE page_id = @page_id
		ORDER BY pt_id;
	ELSE
		SET @l_pt_id = @pt_id;

	if(isnull(@l_pt_id,0)=0 )
		begin
			INSERT INTO dbo.page_templates( page_id,pt_content,created_by,created_date) 
			VALUES (@page_id, @pt_content,@user_id, GETDATE())
			set @new_id	=@@identity
		end
	else
		set @new_id=@l_pt_id
		begin
			UPDATE dbo.page_templates 
			SET 
			  page_id=@page_id
			, pt_content=@pt_content 
			, updated_by =  @user_id
			, updated_date = GETDATE()
			where pt_id=@l_pt_id
		end	  
	
END 







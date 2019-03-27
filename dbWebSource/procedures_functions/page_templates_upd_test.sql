CREATE PROCEDURE [dbo].[page_templates_upd_test](
        @pt_id		INT			= NULL                      
       ,@page_id	INT			= NULL   
       ,@pt_content	VARCHAR(max)= NULL
	   ,@user_id	INT    
	   ,@pt_name	VARCHAR(100)= NULL
	   ,@new_id		INT			= NULL OUTPUT 

)
AS 
BEGIN
SET NOCOUNT ON 

	IF(@page_id IS NULL AND NOT @pt_name IS NULL) -- this is for codes deployment
	BEGIN
		select top 1 @page_id=page_id from pages where page_name=@pt_name
		IF( @page_id IS NULL)
		BEGIN
			INSERT INTO pages (page_name,page_title,master_page_id,created_by,created_date)
			VALUES( 
					@pt_name
					,@pt_name
					,2 --default is: _layout
					,@user_id
					,GETDATE()
			)
			set @page_id=@@identity
		END
		select top 1 @pt_id=pt_id from page_templates where page_id=@page_id
	END

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







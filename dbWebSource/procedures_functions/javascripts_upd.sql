CREATE  PROCEDURE [dbo].[javascripts_upd](
        @js_id		INT			= NULL                      
       ,@page_id	INT			= NULL   
       ,@js_content	VARCHAR(max)= NULL   
	   ,@user_id	INT		
	   ,@js_name	VARCHAR(100)= NULL   
	   ,@new_id		INT			= NULL OUTPUT 

)
AS 
BEGIN
SET NOCOUNT ON 
declare @rev_no INT =0 
declare @l_js_id INT;

IF(@page_id IS NULL AND NOT @js_name IS NULL) --This is for codes deployment
BEGIN
	select top 1 @page_id=page_id from pages where page_name=@js_name
	IF( @page_id IS NULL)
	BEGIN
		INSERT INTO pages (page_name,page_title,master_page_id,created_by,created_date)
		VALUES( 
				@js_name
				,@js_name
				,2 --default is: _layout
				,@user_id
				,GETDATE()
		)
		set @page_id=@@identity
	END
	select top 1 @js_id=js_id from javascripts where page_id=@page_id
END

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
			INSERT INTO dbo.javascripts( page_id,js_name,js_content,rev_no,created_by,created_date) 
			VALUES (@page_id, @js_name,@js_content,1,@user_id,GETDATE())
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

 




CREATE PROCEDURE [dbo].[page_includes_upd]
(
    @tt    page_includes_tt READONLY
   ,@user_id int
)
AS

BEGIN
-- Update Process
    UPDATE a 
        SET  page_id  = b.page_id
			,storage_location  = b.storage_location
			,library_name  = b.library_name
            ,updated_by   = @user_id
            ,updated_date = GETDATE()
     FROM dbo.page_includes a INNER JOIN @tt b
        ON a.page_include_id = b.page_include_id 
		WHERE isnull(b.is_edited,'N') = 'Y'

-- Insert Process

    INSERT INTO page_includes (
         page_id
		,storage_location
		,library_name
        ,created_by
        ,created_date
        )
    SELECT 
	    isnull(page_id,2) --default is: _layout
       ,storage_location
	   ,library_name
       ,@user_id
       ,GETDATE()
    FROM @tt
    WHERE page_include_id IS NULL
END


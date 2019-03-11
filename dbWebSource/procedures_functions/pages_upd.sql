create PROCEDURE [dbo].[pages_upd]
(
    @tt    pages_tt READONLY
   ,@user_id int
)
AS

BEGIN
-- Update Process
    UPDATE a 
        SET  page_name  = b.page_name
			,page_title  = b.page_title
			,is_public   = b.is_public
			,master_page_id  = b.master_page_id
            ,updated_by   = @user_id
            ,updated_date = GETDATE()
     FROM dbo.pages a INNER JOIN @tt b
        ON a.page_id = b.page_id 
       WHERE (
				isnull(a.page_name,'') <> isnull(b.page_name,'')   
			OR  isnull(a.page_title,'') <> isnull(b.page_title,'')   
			OR  isnull(a.is_public,'') <> isnull(b.is_public,'') 
			OR  isnull(a.master_page_id,0) <> isnull(b.master_page_id,0)   
	   )

-- Insert Process

    INSERT INTO pages (
         page_name
		,page_title
		,is_public
		,master_page_id
        ,created_by
        ,created_date
        )
    SELECT 
        page_name
	   ,page_title
	   ,is_public
	   ,isnull(master_page_id,2) --default is: _layout
       ,@user_id
       ,GETDATE()
    FROM @tt
    WHERE page_id IS NULL
END



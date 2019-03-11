

CREATE PROCEDURE [dbo].[master_pages_upd]

(

    @tt    master_pages_tt READONLY
   ,@user_id int
)

AS

BEGIN

declare @v varchar(10) = 'zeT@1'

-- Update Process

    UPDATE a 

        SET  master_page_name  = b.master_page_name

            ,updated_by   = @user_id

            ,updated_date = GETDATE()

     FROM dbo.master_pages a INNER JOIN @tt b

        ON a.master_page_id = b.master_page_id 

       AND (

				COALESCE(a.master_page_name,@v) <> COALESCE(b.master_page_name,@v)   

			

	   )



-- Insert Process



    INSERT INTO master_pages (

         master_page_name

        ,created_by

        ,created_date

        )

    SELECT 

        master_page_name

       ,@user_id

       ,GETDATE()

    FROM @tt

    WHERE master_page_id IS NULL

END

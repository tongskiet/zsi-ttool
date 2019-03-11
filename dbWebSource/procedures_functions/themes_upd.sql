


create PROCEDURE [dbo].[themes_upd]
(
    @tt		themes_tt READONLY
    ,@user_id int
)
AS

BEGIN
-- Update Process
    UPDATE a 
    SET  theme_name				= b.theme_name		
        ,updated_by				= @user_id
        ,updated_date			= GETDATE()
    FROM dbo.themes a INNER JOIN @tt b
    ON a.theme_id = b.theme_id
    WHERE (
			isnull(a.theme_name,'')		<> isnull(b.theme_name,'')  
		
		
	)
	   
-- Insert Process
    INSERT INTO dbo.themes (
         theme_name		
        ,created_by
        ,created_date
        )
    SELECT 
        theme_name 	   
       ,@user_id
       ,GETDATE()
    FROM @tt
    WHERE theme_id IS NULL;
END



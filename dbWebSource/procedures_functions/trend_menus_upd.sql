
CREATE PROCEDURE [dbo].[trend_menus_upd]
(
    @tt    trend_menus_tt READONLY
   ,@user_id	int
)
AS
SET NOCOUNT ON;
DECLARE @updated_count INT;
-- Update Process
	UPDATE a 
		 SET  menu_name			= b.menu_name
			 ,menu_type			= b.menu_type
			 ,seq_no			= b.seq_no
			 ,specs_id			= b.specs_id
       FROM dbo.trend_menus a INNER JOIN @tt b
	     ON a.menu_id = b.menu_id
	    AND ISNULL(b.is_edited,'N')='Y';

SET @updated_count = @@ROWCOUNT;

-- Insert Process
	INSERT INTO trend_menus(
	 	 menu_name	
		,menu_type	
		,seq_no	
		,specs_id		
    )
	SELECT 
	      menu_name	
		 ,menu_type	
		 ,seq_no	
		 ,specs_id	
	FROM @tt 
	WHERE menu_id IS NULL
	     AND menu_name IS NOT NULL;

	SET @updated_count = @updated_count + @@ROWCOUNT;
RETURN @updated_count;





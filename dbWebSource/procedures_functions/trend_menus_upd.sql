
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
		     ,image_name		= b.image_name
			 ,icon_name			= b.icon_name
			 ,menu_type			= b.menu_type
			 ,seq_no			= b.seq_no
			 ,specs_id			= b.specs_id
	 		 
       FROM dbo.trend_menus a INNER JOIN @tt b
	     ON a.menu_id = b.menu_id
	    AND (
			isnull(a.menu_name,'')	<> isnull(b.menu_name,'')
		 OR isnull(a.image_name,'') <> isnull(b.image_name,'')
		 OR isnull(a.icon_name,'')	<> isnull(b.icon_name,'')
		 OR isnull(a.menu_type,'')	<> isnull(b.menu_type,'')
		 OR isnull(a.seq_no,'')		<> isnull(b.seq_no,'')
		 OR isnull(a.specs_id,'')	<> isnull(b.specs_id,'')
		 
		);

SET @updated_count = @@ROWCOUNT;

-- Insert Process
	INSERT INTO trend_menus(
	 	 menu_name	
		,image_name
		,icon_name	
		,menu_type	
		,seq_no	
		,specs_id		
		

    )
	SELECT 
	      menu_name	
		 ,image_name
		 ,icon_name	
		 ,menu_type	
		 ,seq_no	
		 ,specs_id	
		
	FROM @tt 
	WHERE menu_id IS NULL;


	SET @updated_count = @updated_count + @@ROWCOUNT;
RETURN @updated_count;





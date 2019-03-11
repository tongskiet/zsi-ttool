CREATE PROCEDURE [dbo].[menus_upd]
(
   @tt    menus_tt READONLY
   ,@user_id int
)
AS
-- Update Process
	UPDATE a 
		   SET 
	   	      pmenu_id	   = b.pmenu_id
			 ,menu_name	   = b.menu_name
			 ,page_id	   = b.page_id
			 ,parameters   = b.parameters
	 		 ,seq_no       = b.seq_no
			 ,is_default   = b.is_default
	   	     ,updated_by   = @user_id
			 ,updated_date = GETDATE()
       FROM dbo.menus a INNER JOIN @tt b
	     ON a.menu_id = b.menu_id 
	    AND (
		    isnull(a.pmenu_id,0) <> isnull(b.pmenu_id,0)
		 OR isnull(a.menu_name,'') <> isnull(b.menu_name,'')
		 OR isnull(a.seq_no,0) <> isnull(b.seq_no,0)
		 OR isnull(a.page_id,0) <> isnull(b.page_id,0)
		 OR isnull(a.parameters,'') <> isnull(b.parameters,'')
		 OR isnull(a.is_default,'') <> isnull(b.is_default,'')
		 )
-- Insert Process
	INSERT INTO menus (
         menu_name
		,pmenu_id
		,page_id
		,parameters
		,seq_no
		,created_by
		,created_date
    )
	SELECT 
		 menu_name
		,pmenu_id
		,page_id
		,parameters
		,seq_no
	   ,@user_id
	   , GETDATE()
	FROM @tt 
	WHERE menu_id IS NULL
      AND menu_name IS NOT NULL;

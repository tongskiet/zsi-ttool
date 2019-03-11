CREATE PROCEDURE [dbo].[menus_sel]
(
    @menu_id  INT = null
   ,@pmenu_id INT = NULL
)
AS
BEGIN
	DECLARE @stmt		VARCHAR(4000);
    SET @stmt = 'SELECT * FROM dbo.menus_v '
    
	IF @menu_id <> '' 
	    SET @stmt = @stmt + ' AND menu_id'+ @menu_id;

    IF @pmenu_id <> ''
	     SET @stmt = @stmt + ' AND menu_id'+ @pmenu_id;

 	SET @stmt = @stmt + ' ORDER BY seq_no';
	exec(@stmt);
 END;



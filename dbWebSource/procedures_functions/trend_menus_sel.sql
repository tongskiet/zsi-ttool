CREATE PROCEDURE [dbo].[trend_menus_sel]
(
	 @menu_id  INT = null
	,@trend_menu_id INT = NULL
)
AS
BEGIN
	DECLARE @stmt		VARCHAR(4000);
	SET @stmt = 'SELECT * FROM dbo.trend_menus WHERE 1=1 ';

	IF @menu_id <> '' 
	SET @stmt = @stmt + ' AND menu_id' + CAST(@menu_id AS VARCHAR);

	IF @trend_menu_id <> ''
	     SET @stmt = @stmt + ' AND menu_id'+ @trend_menu_id;

 	SET @stmt = @stmt + ' ORDER BY seq_no';
	exec(@stmt);
 END;

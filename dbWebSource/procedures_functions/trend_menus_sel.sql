CREATE PROCEDURE [dbo].[trend_menus_sel]
(
	 @user_id INT = null
	,@rpp INT = null
	,@menu_id  INT = null
	,@trend_menu_id INT = NULL
	,@menu_type char(1) = 'E'
)
AS
BEGIN
	DECLARE @stmt		VARCHAR(4000);
	SET @stmt = 'SELECT * FROM dbo.trend_menus WHERE menu_type= ''' + @menu_type + ''''

	IF @menu_id <> '' 
	SET @stmt = @stmt + ' AND menu_id' + CAST(@menu_id AS VARCHAR);

	IF @trend_menu_id <> ''
	     SET @stmt = @stmt + ' AND menu_id'+ @trend_menu_id;

 	SET @stmt = @stmt + ' ORDER BY seq_no';
	exec(@stmt);
 END;


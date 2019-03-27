CREATE PROCEDURE [dbo].[criterias_sel]
(
    @user_id		INT = null
   ,@trend_menu_id  INT = NULL
   ,@criteria_id	INT = null
   ,@pcriteria_id	INT = NULL
)
AS
BEGIN
	DECLARE @stmt		VARCHAR(4000);
	SET @stmt = 'SELECT * FROM dbo.criterias WHERE trend_menu_id = ' + CAST(@trend_menu_id AS VARCHAR(20));

	IF @criteria_id <> '' 
	SET @stmt = @stmt + ' AND criteria_id' + CAST(@criteria_id AS VARCHAR);

	IF @pcriteria_id <> ''
		SET @stmt = @stmt + ' AND pcriteria_id'+ @pcriteria_id;

    set @stmt = @stmt + ' order by seq_no'
	exec(@stmt);
 END;

CREATE PROCEDURE [dbo].[criteria_column_values_sel]
(
    @user_id			INT = null
   ,@criteria_column_id	INT = null
)
AS
BEGIN
	SELECT * FROM dbo.criteria_column_values WHERE criteria_column_id	 = @criteria_column_id;
 END;



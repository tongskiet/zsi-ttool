CREATE PROCEDURE [dbo].[criteria_column_values_sel]
(
   @criteria_column_id			INT = null
)
AS
BEGIN
	SELECT * FROM dbo.criteria_column_values WHERE criteria_column_id	 = @criteria_column_id;
 END;



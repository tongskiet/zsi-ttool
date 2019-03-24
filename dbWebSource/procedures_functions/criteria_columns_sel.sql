CREATE PROCEDURE [dbo].[criteria_columns_sel]
(
   @user_id		INT = null
  ,@criteria_id	INT 
)
AS
BEGIN
  SELECT * FROM dbo.criteria_columns WHERE criteria_id = @criteria_id

 END;
 --criteria_columns_sel @criteria_id=1
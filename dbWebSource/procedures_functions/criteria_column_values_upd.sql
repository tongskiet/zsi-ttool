CREATE PROCEDURE [dbo].[criteria_column_values_upd]
(
    @tt    criteria_column_values_tt READONLY
   ,@user_id int
)
AS
BEGIN
SET NOCOUNT ON

DELETE FROM dbo.criteria_column_values WHERE ISNULL(attribute_value,'')='' AND criteria_column_value_id IN (SELECT criteria_column_value_id FROM @tt) 
-- Update Process
	UPDATE a 
		   SET 
	   	      criteria_column_id	= b.criteria_column_id
			 ,attribute_value		= b.attribute_value
	   	     ,updated_by            = @user_id
			 ,updated_date          = GETDATE()
	   FROM dbo.criteria_column_values a INNER JOIN @tt b
	     ON a.criteria_column_value_id = b.criteria_column_value_id 
	    AND (isnull(is_edited,'N')='Y')

-- Insert Process
	INSERT INTO criteria_column_values (
         criteria_column_id
		,attribute_value
		,created_by
		,created_date
    )
	SELECT 
         criteria_column_id
		,attribute_value
    	,@user_id
	    ,GETDATE()
	FROM @tt 
	WHERE criteria_column_value_id IS NULL
      AND criteria_column_id IS NOT NULL
	  AND attribute_value IS NOT NULL;

END 
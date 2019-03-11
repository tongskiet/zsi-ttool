
CREATE PROCEDURE [dbo].[criteria_columns_upd]
(
    @tt    criteria_columns_tt READONLY
   ,@user_id int
)
AS
BEGIN
SET NOCOUNT ON
   DECLARE @criteria_column_id INT
   DECLARE @column_name varchar(20)
   DECLARE @operator_value varchar(20)
-- DELETE
   DELETE FROM dbo.criteria_columns WHERE criteria_column_id IN (SELECT criteria_column_id FROM @tt WHERE ISNULL(column_name,'')='')

-- Update Process
	UPDATE a 
		   SET 
	   	      criteria_id	= b.criteria_id
			 ,column_name		= b.column_name
			 ,operator_value = b.operator_value
			 ,column_value  = b.column_value
			 ,column_value2  = b.column_value2
			 ,is_output     = b.is_output
		     ,updated_by    = @user_id
			 ,updated_date  = GETDATE()

	   FROM dbo.criteria_columns a INNER JOIN @tt b
	     ON a.criteria_column_id = b.criteria_column_id 
	    AND (isnull(is_edited,'N')='Y')

-- Insert Process
	INSERT INTO criteria_columns (
         criteria_id
		,column_name
		,operator_value
		,column_value
		,column_value2
		,is_output
		,created_by
		,created_date

    )
	SELECT 
         criteria_id
		,column_name
		,operator_value
		,column_value
		,column_value2
		,is_output
    	,@user_id
	    ,GETDATE()
	FROM @tt 
	WHERE criteria_column_id IS NULL
      AND criteria_id IS NOT NULL
	  AND column_name IS NOT NULL;
/*
	IF @operator_value = 'ISNULL'
	BEGIN
	   IF ISNULL(@criteria_column_id,0) = 0
		  SET @criteria_column_id = @@IDENTITY 

       SELECT @operator_value=operator_value, @column_name=column_name FROM dbo.criteria_columns WHERE criteria_column_id=@criteria_column_id
  	   INSERT INTO dbo.criteria_columns_param SELECT @criteria_column_id,'ISNULL('  + @column_name + ','''')<>'''''
	END 
*/
END
	


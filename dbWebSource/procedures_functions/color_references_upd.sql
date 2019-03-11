
CREATE PROCEDURE [dbo].[color_references_upd]
(
    @tt    color_references_tt READONLY
   ,@user_id	int
)
AS
SET NOCOUNT ON;
DECLARE @updated_count INT;
-- Update Process
	UPDATE a 
		 SET  color_code		= b.color_code
		     ,color_name		= b.color_name
	 		 
       FROM dbo.color_references a INNER JOIN @tt b
	     ON a.color_id = b.color_id
	    AND (
			isnull(a.color_code,'') <> isnull(b.color_code,'')
		 OR isnull(a.color_name,'') <> isnull(b.color_name,'')
		 
		);

SET @updated_count = @@ROWCOUNT;

-- Insert Process
	INSERT INTO color_references (
	 	 color_code
		,color_name
		
    )
	SELECT 
	     color_code
	 	,color_name
		
	FROM @tt 
	WHERE color_id IS NULL;


	SET @updated_count = @updated_count + @@ROWCOUNT;
RETURN @updated_count;





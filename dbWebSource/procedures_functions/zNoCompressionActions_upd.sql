
CREATE PROCEDURE [dbo].[zNoCompressionActions_upd]
(
    @tt    zNoCompressionActions_tt READONLY
   ,@user_id int
)
AS
-- Update Process
	UPDATE a 
		 SET actionname   = b.actionname	 		
	   	    
       FROM dbo.zNoCompressionActions a INNER JOIN @tt b
	     ON a.id = b.id 
	    AND 
			(
				isnull(a.actionname,'')   <> isnull(b.actionname,'')   			 
			)

-- Insert Process
	INSERT INTO zNoCompressionActions (
		 actionname		
		
    )
	SELECT 
		 actionname
		
	FROM @tt 
	WHERE id IS NULL
	  AND actionname IS NOT NULL







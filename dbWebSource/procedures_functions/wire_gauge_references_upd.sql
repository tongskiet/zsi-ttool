
CREATE PROCEDURE [dbo].[wire_gauge_references_upd]
(
    @tt    wire_gauge_references_tt READONLY
   ,@user_id	int
)
AS
BEGIN
SET NOCOUNT ON;
DECLARE @updated_count INT;
-- Update Process
	UPDATE a 
		 SET  wire_gauge		= b.wire_gauge
		     ,color_id			= b.color_id
			 ,jaso_lower_limit  = b.jaso_lower_limit
			 ,jaso_upper_limit  = b.jaso_upper_limit
			 ,iso_lower_limit   = b.iso_lower_limit
			 ,iso_upper_limit   = b.iso_upper_limit
			 ,updated_by        = @user_id
			 ,updated_date      = GETDATE()
       FROM dbo.wire_gauge_references a INNER JOIN @tt b
	     ON a.wire_gauge = b.wire_gauge
	    AND (ISNULL(is_edited,'N')='Y');
END

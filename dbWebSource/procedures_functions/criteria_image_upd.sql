
CREATE PROCEDURE [dbo].[criteria_image_upd]
(
    @criteria_id   int
   ,@image1_id     int=null
   ,@image2_id     int=null
   ,@user_id	   int
)
AS
BEGIN
SET NOCOUNT ON;
	UPDATE dbo.criterias 
		 SET  image1_id       = ISNULL(@image1_id,image1_id)
			 ,image2_id       = ISNULL(@image2_id,image2_id)
			 ,image_by        = @user_id
			 ,image_date      = GETDATE()
		 WHERE criteria_id = @criteria_id;

END;






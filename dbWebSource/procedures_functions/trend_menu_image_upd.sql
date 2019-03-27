
CREATE PROCEDURE [dbo].[trend_menu_image_upd]
(
    @tren_menu_id  int
   ,@image1_id     int=null
   ,@image2_id     int=null
   ,@image3_id     int=null
   ,@image4_id     int=null
   ,@fa_icon       nvarchar(50)=null
   ,@user_id	   int
)
AS
BEGIN
SET NOCOUNT ON;
	UPDATE dbo.trend_menus 
		 SET  image1_id       = ISNULL(@image1_id,image1_id)
			 ,image2_id       = ISNULL(@image2_id,image2_id)
			 ,image3_id       = ISNULL(@image3_id,image3_id)
			 ,image4_id       = ISNULL(@image4_id,image4_id)
			 ,fa_icon         = ISNULL(@fa_icon,@fa_icon)
			 ,image_by        = @user_id
			 ,image_date      = GETDATE()
		 WHERE menu_id = @tren_menu_id;
END;






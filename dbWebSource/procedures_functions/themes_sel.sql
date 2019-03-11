create PROCEDURE [dbo].[themes_sel]
(
    @theme_id  INT = null
)
AS
BEGIN

SET NOCOUNT ON

  IF @theme_id IS NOT NULL  
	 SELECT * FROM dbo.themes WHERE theme_id = theme_id; 
  ELSE
     SELECT * FROM dbo.themes
	 ORDER BY theme_name; 
	
END
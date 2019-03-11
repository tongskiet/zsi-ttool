
CREATE PROCEDURE [dbo].[role_menus_sel]
(
   @role_id  INT = null
)
AS
BEGIN
  IF ISNULL(@role_id,0) =0  
     SELECT * FROM role_menus_v ;
  ELSE
      SELECT role_menu_id, role_id, menu_id, menu_name, is_write, is_delete, is_new, parameters FROM role_menus_v WHERE role_id = @role_id 
	  UNION
	  SELECT NULL as role_menu_id, null as role_id, menu_id, menu_name, null as is_write, null as is_delete, null as is_new, parameters FROM menus a
	    WHERE ISNULL(is_default,'N')='N' and ISNULL(is_zsi_only,'N')='N' AND NOT EXISTS (select menu_id FROM role_menus_v b where b.menu_id = a.menu_id AND b.role_id = @role_id);
END


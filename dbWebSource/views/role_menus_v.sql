CREATE VIEW dbo.role_menus_v
AS
SELECT        dbo.role_menus.role_menu_id, dbo.role_menus.role_id, dbo.role_menus.is_write, dbo.role_menus.is_delete, dbo.menus.menu_id, dbo.menus.pmenu_id, dbo.menus.menu_name, dbo.menus.seq_no, dbo.menus.is_default, 
                         dbo.pages.page_id, dbo.pages.page_name, dbo.pages.page_title, dbo.roles.role_name, dbo.role_menus.is_new, dbo.menus.parameters
FROM            dbo.role_menus INNER JOIN
                         dbo.menus ON dbo.role_menus.menu_id = dbo.menus.menu_id INNER JOIN
                         dbo.roles ON dbo.role_menus.role_id = dbo.roles.role_id LEFT OUTER JOIN
                         dbo.pages ON dbo.menus.page_id = dbo.pages.page_id

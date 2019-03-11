CREATE VIEW [dbo].[menus_v]
AS
SELECT        dbo.menus.menu_id, dbo.menus.pmenu_id, dbo.menus.menu_name, dbo.menus.seq_no, dbo.menus.page_id, dbo.menus.is_default, dbo.pages.page_name, 
              dbo.menus.parameters, dbo.countPageProcesses(dbo.menus.page_id) as ProcessCount,dbo.menus.icon
FROM          dbo.menus LEFT OUTER JOIN
              dbo.pages ON dbo.menus.page_id = dbo.pages.page_id




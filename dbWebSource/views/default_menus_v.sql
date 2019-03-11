CREATE VIEW dbo.default_menus_v
AS
SELECT        dbo.menus.menu_id, dbo.menus.pmenu_id, dbo.menus.menu_name, dbo.menus.seq_no, dbo.menus.page_id, dbo.menus.parameters, dbo.menus.is_default, dbo.menus.created_by, dbo.menus.created_date, 
                         dbo.menus.updated_by, dbo.menus.updated_date, dbo.menus.is_zsi_only, dbo.pages.page_name, dbo.pages.page_title
FROM            dbo.menus LEFT OUTER JOIN
                         dbo.pages ON dbo.menus.page_id = dbo.pages.page_id
WHERE        (dbo.menus.is_default = 'Y')

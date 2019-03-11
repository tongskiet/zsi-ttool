CREATE VIEW dbo.projects_v
AS
SELECT        TOP (100) PERCENT dbo.projects.*, dbo.oem.oem_name, dbo.vehicle_models.vehicle_model_name, dbo.country.country_name, dbo.regions.region_name
FROM            dbo.regions INNER JOIN
                         dbo.country ON dbo.regions.region_id = dbo.country.region_id INNER JOIN
                         dbo.projects INNER JOIN
                         dbo.vehicle_models ON dbo.projects.vehicle_model_id = dbo.vehicle_models.vehicle_model_id INNER JOIN
                         dbo.oem ON dbo.vehicle_models.oem_id = dbo.oem.oem_id ON dbo.country.country_id = dbo.projects.origin_country_id
ORDER BY dbo.oem.oem_name, dbo.vehicle_models.vehicle_model_name

create PROCEDURE [dbo].[sync_process] 
AS
BEGIN
SET NOCOUNT ON
DECLARE @specs_id INT
DECLARE @project_id INT
DECLARE @id INT=0
    SELECT @id = id FROM projects_for_sync WHERE status_id=2;
	IF ISNULL(@id,0) = 0 
	BEGIN
		SELECT TOP 1 @id = id, @specs_id = specs_id, @project_id=project_id FROM projects_for_sync WHERE status_id=1;
		IF ISNULL(@id,0) <> 0 
		BEGIN
			UPDATE projects_for_sync SET status_id = 2 WHERE id=@id;
			IF @specs_id = 40 
				BEGIN
					exec dbo.cutsheet_ins @project_ids=@project_id;
					exec dbo.integrated_function_ins @project_ids=@project_id;
					exec dbo.network_topology_ins @project_ids=@project_id;
					exec dbo.connector_ins @project_ids=@project_id;
					exec dbo.splice_ins @project_ids=@project_id;
					exec dbo.plating_ins @project_ids=@project_id;
				END

			IF @specs_id = 42 
				exec dbo.covering_ins  @project_ids=@project_id;

			IF @specs_id = 1050 
			   exec dbo.harness_info_ins @project_ids=@project_id;

			IF @specs_id = 1051 
			   exec dbo.grommet_ins @project_ids=@project_id;

			IF @specs_id = 1053
			   exec dbo.retainer_ins @project_ids=@project_id;

			IF @specs_id = 1056
			   exec dbo.power_distributions_ins @project_ids=@project_id;

			IF @specs_id = 1052 
			   exec dbo.stc_ins @project_ids=@project_id;

			UPDATE projects_for_sync SET status_id = 3 WHERE id=@id;    
		END
	END
END
CREATE FUNCTION dbo.ShowOrganization
(
	@user_id INT,
	@organization_id INT,
	@level_no INT
)
RETURNS VARCHAR(1)
AS
BEGIN
	DECLARE @organization_id2 INT;
	DECLARE @is_admin VARCHAR(1);
	SELECT @organization_id2 = organization_id,
	       @is_admin = is_admin
	  FROM dbo.users
	 WHERE user_id = @user_id;

	IF @is_admin = 'Y' AND @level_no = 1
		RETURN 'Y';
	ELSE IF @organization_id = @organization_id2
		RETURN 'Y';
	   
	RETURN 'N';
END

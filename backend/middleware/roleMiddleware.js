// ============================================
// ROLE BASED ACCESS CONTROL MIDDLEWARE
// ============================================

const authorizeRoles =
  (...allowedRoles) => {

    return (
      req,
      res,
      next
    ) => {

      try {

        // ======================================
        // CHECK AUTHENTICATION
        // ======================================

        if (!req.user) {

          return res.status(401).json({

            success: false,

            message:
              "Authentication required.",

          });

        }


        // ======================================
        // GET USER ROLE
        // ======================================

        const userRole =
          req.user.role
            ?.toLowerCase();


        // ======================================
        // NORMALIZE ALLOWED ROLES
        // ======================================

        const normalizedRoles =
          allowedRoles.map(
            (role) =>
              role.toLowerCase()
          );


        // ======================================
        // CHECK PERMISSION
        // ======================================

        if (
          !normalizedRoles.includes(
            userRole
          )
        ) {

          return res.status(403).json({

            success: false,

            message:
              "You do not have permission to access this resource.",

            currentRole:
              userRole,

            requiredRoles:
              normalizedRoles,

          });

        }


        // ======================================
        // ACCESS GRANTED
        // ======================================

        next();

      } catch (error) {

        console.error(
          "Role Authorization Error:",
          error.message
        );

        return res.status(500).json({

          success: false,

          message:
            "Authorization failed.",

        });

      }

    };

  };


module.exports = {

  authorizeRoles,

};
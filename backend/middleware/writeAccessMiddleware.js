const writeAccessMiddleware =
  (req, res, next) => {

    try {

      if (!req.user) {

        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });

      }


      // Viewer can only read data

      if (req.user.role === "viewer") {

        return res.status(403).json({
          success: false,
          message:
            "Access denied. Viewer has read-only access.",
        });

      }


      next();

    } catch (error) {

      console.error(
        "Write Access Error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });

    }

  };


module.exports =
  writeAccessMiddleware;
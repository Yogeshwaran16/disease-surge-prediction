const districtMiddleware = (req, res, next) => {

  try {

    // ============================================
    // CHECK AUTHENTICATED USER
    // ============================================

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

    }


    const {
      role,
      district,
    } = req.user;


    // ============================================
    // ADMIN CAN ACCESS ALL DISTRICTS
    // ============================================

    if (role === "admin") {

      return next();

    }


    // ============================================
    // GET REQUESTED DISTRICT
    // ============================================

    const requestedDistrict =
      req.params.district ||
      req.query.district ||
      req.body.district;


    // ============================================
    // DISTRICT REQUIRED
    // ============================================

    if (!requestedDistrict) {

      return res.status(400).json({
        success: false,
        message: "District is required.",
      });

    }


    // ============================================
    // HEALTH OFFICER DISTRICT CHECK
    // ============================================

    if (
      role === "health_officer" &&
      district === requestedDistrict
    ) {

      return next();

    }


    // ============================================
    // ACCESS DENIED
    // ============================================

    return res.status(403).json({
      success: false,
      message:
        "Access denied. You can only access your assigned district.",
    });

  } catch (error) {

    console.error(
      "District Authorization Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error.",
    });

  }

};


module.exports = districtMiddleware;
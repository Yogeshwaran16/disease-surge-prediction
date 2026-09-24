const User = require("../models/User");


// ============================================
// GET ALL USERS
// ============================================

exports.getAllUsers = async (req, res) => {

  try {

    const users = await User
      .find()
      .select("-password")
      .sort({
        createdAt: -1,
      });


    return res.status(200).json({

      success: true,

      count: users.length,

      users,

    });

  } catch (error) {

    console.error(
      "Get All Users Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch users.",

    });

  }

};


// ============================================
// GET USER BY ID
// ============================================

exports.getUserById = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.params.id
      ).select("-password");


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found.",

      });

    }


    return res.status(200).json({

      success: true,

      user,

    });

  } catch (error) {

    console.error(
      "Get User Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch user.",

    });

  }

};


// ============================================
// CREATE USER
// ADMIN ONLY
// ============================================

exports.createUser = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      password,
      role,
      district,
    } = req.body;


    // VALIDATE INPUT

    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Name, email and password are required.",

      });

    }


    // CHECK EMAIL

    const existingUser =
      await User.findOne({

        email:
          email.toLowerCase(),

      });


    if (existingUser) {

      return res.status(409).json({

        success: false,

        message:
          "Email already exists.",

      });

    }


    // VALIDATE ROLE

    const allowedRoles = [

      "admin",

      "health_officer",

      "viewer",

    ];


    const userRole =
      role || "viewer";


    if (
      !allowedRoles.includes(
        userRole
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid role.",

      });

    }


    // CREATE USER
    // PASSWORD IS HASHED
    // AUTOMATICALLY IN User MODEL

    const user =
      await User.create({

        name,

        email:
          email.toLowerCase(),

        password,

        role:
          userRole,

        district:
          district || null,

      });


    return res.status(201).json({

      success: true,

      message:
        "User created successfully.",

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        district:
          user.district,

      },

    });

  } catch (error) {

    console.error(
      "Create User Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to create user.",

    });

  }

};


// ============================================
// UPDATE USER
// ============================================

exports.updateUser = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      role,
      district,
      isActive,
    } = req.body;


    // FIND USER

    const user =
      await User.findById(
        req.params.id
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found.",

      });

    }


    // UPDATE NAME

    if (name) {

      user.name =
        name;

    }


    // UPDATE EMAIL

    if (email) {

      const normalizedEmail =
        email.toLowerCase();


      const existingUser =
        await User.findOne({

          email:
            normalizedEmail,

          _id: {
            $ne:
              user._id,
          },

        });


      if (existingUser) {

        return res.status(409).json({

          success: false,

          message:
            "Email already exists.",

        });

      }


      user.email =
        normalizedEmail;

    }


    // UPDATE ROLE

    if (role) {

      const allowedRoles = [

        "admin",

        "health_officer",

        "viewer",

      ];


      if (
        !allowedRoles.includes(
          role
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid role.",

        });

      }


      user.role =
        role;

    }


    // UPDATE DISTRICT

    if (
      district !== undefined
    ) {

      user.district =
        district;

    }


    // UPDATE ACTIVE STATUS

    if (
      typeof isActive ===
      "boolean"
    ) {

      user.isActive =
        isActive;

    }


    await user.save();


    return res.status(200).json({

      success: true,

      message:
        "User updated successfully.",

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        district:
          user.district,

        isActive:
          user.isActive,

      },

    });

  } catch (error) {

    console.error(
      "Update User Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to update user.",

    });

  }

};


// ============================================
// DELETE USER
// ============================================

exports.deleteUser = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.params.id
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found.",

      });

    }


    await User.findByIdAndDelete(
      req.params.id
    );


    return res.status(200).json({

      success: true,

      message:
        "User deleted successfully.",

      deletedUser: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

      },

    });

  } catch (error) {

    console.error(
      "Delete User Error:",
      error.message
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to delete user.",

    });

  }

};
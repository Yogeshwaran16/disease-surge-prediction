const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error(
        "Error:",
        err.stack
    );

    // Mongoose Validation Error
    if (
        err.name ===
        "ValidationError"
    ) {

        const errors =
            Object.values(
                err.errors
            ).map(
                (val) =>
                    val.message
            );

        return res.status(400).json({
            success: false,
            error: "Validation Error",
            messages: errors
        });
    }

    // Mongoose Cast Error
    if (
        err.name ===
        "CastError"
    ) {

        return res.status(400).json({
            success: false,
            error: "Invalid ID Format"
        });
    }

    // Duplicate Key Error
    if (
        err.code === 11000
    ) {

        return res.status(409).json({
            success: false,
            error:
                "Duplicate Record Found"
        });
    }

    // JWT Errors
    if (
        err.name ===
        "JsonWebTokenError"
    ) {

        return res.status(401).json({
            success: false,
            error:
                "Invalid Token"
        });
    }

    if (
        err.name ===
        "TokenExpiredError"
    ) {

        return res.status(401).json({
            success: false,
            error:
                "Token Expired"
        });
    }

    // Default Error
    res.status(
        err.statusCode || 500
    ).json({

        success: false,

        error:
            err.message ||
            "Internal Server Error",

        stack:
            process.env.NODE_ENV ===
            "development"
                ? err.stack
                : undefined
    });
};

module.exports =
errorHandler;
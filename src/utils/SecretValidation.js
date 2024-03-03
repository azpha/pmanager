module.exports = (req,res,next) => {
    if (!req.query || !req.query.secret || req.query.secret !== process.env.SECRET) {
        return res.status(401).json({
            status: 401,
            message: "Invalid/no secret provided"
        })
    } else next();
}
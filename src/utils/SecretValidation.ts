import type {
    Request,
    Response,
    NextFunction
} from 'express';

const ValidateSecret = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (
        !req.headers ||
        !req.headers["authorization"] ||
        req.headers.authorization !== ("Bearer " + process.env.SECRET)
    ) {
        return res.status(403).json({
            status: 403,
            message: "Invalid secret provided"
        })
    } else {
        next();
    }
}

export default {
    ValidateSecret
}
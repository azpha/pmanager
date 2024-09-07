import * as crypto from 'crypto';
import type {
    WebhookRequest
} from './types';
import type {
    Response,
    NextFunction
} from 'express';

const validateSecret = async (
    req: WebhookRequest,
    res: Response,
    next: NextFunction
) => {
    // git webhook, token, fail
    if (req.headers["x-hub-signature-256"]) {
        const signature = req.headers["x-hub-signature-256"] as string;
        const secret = process.env.SECRET as string;

        // secret comparing stuff
        const secretHash = crypto.createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        try {
            const verified = crypto.timingSafeEqual(Buffer.from(secretHash), Buffer.from(signature.split("=")[1]));

            if (verified) {
                req.webhook_payload = req.body;
                return next();
            } else {
                return res.status(401).json({
                    status: 401,
                    message: "Invalid or incorrect payload provided"
                })
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: "An error occurred validating that secret"
            })
        }
    } else if (req.headers["authorization"]) {
        const header = req.headers["authorization"] as string;
        const secret = process.env.SECRET as string;

        try {
            const verified = crypto.timingSafeEqual(Buffer.from(header), Buffer.from(secret));

            if (verified) {
                return next();
            } else {
                return res.status(401).json({
                    status: 401,
                    message: "Invalid or incorrect secret provided"
                })
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
                message: "An error occurred validating that secret"
            })
        }
    } else {
        return res.status(401).json({
            status: 401,
            message: "Invalid or incorrect authentication"
        })
    }
}

export default {
    validateSecret
}
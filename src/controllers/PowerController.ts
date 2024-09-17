import pm2 from 'pm2';
import NotificationManager from '../services/NotificationManager';
import type { Response } from 'express';
import type { WebhookRequest } from '../utils/types';

const PowerControl = async function(
    req: WebhookRequest,
    res: Response
) {
    const isFromGitHub = !!req.webhook_payload

    if (isFromGitHub) {
        if (!req.webhook_payload || !req.webhook_payload.repository.name) {
            return res.status(400).json({
                status: 400,
                message: "Missing body parameters"
            })
        }
    } else {
        if ((!req.body && !req.body.scripts && !req.body.action) && !req.query.scripts) {
            return res.status(400).json({
                status: 400,
                message: "Missing body parameters"
            })
        }
    }

    try {
        const scriptNames = (req.body.script || req.query.scripts || req.webhook_payload?.repository.name);

        pm2.connect((err) => {
            if (err) {
                return res.status(500).json({
                    status: 500,
                    message: "Failed to connect"
                })
            } else {
                pm2.list(async (err, proc) => {
                    if (err) {
                        return res.status(500).json({
                            status: 500,
                            message: "Failed to fetch active scripts"
                        })
                    } else {
                        let actionedScripts = [];
                        for (const script of scriptNames.split(",")) {
                            if (proc.filter((v) => v.name === script).length > 0) {
                                if (req.body.action === "restart" || req.body.action === "start" || isFromGitHub) {
                                    pm2.restart(script, (err) => {
                                        if (err) throw err
                                    });
                    
                                    if (process.env.NOTIFICATIONS_ENABLED) {
                                        const sentNotif = await NotificationManager.SendNotification(script, "restarted")
                                        if (!sentNotif) console.log("Failed to send notification!")
                                    }

                                    actionedScripts.push(script);
                                } else if (req.body.action === "stop") {
                                    pm2.stop(script, (err) => {
                                        if (err) throw err
                                    });
                    
                                    if (process.env.NOTIFICATIONS_ENABLED) {
                                        const sentNotif = await NotificationManager.SendNotification(script, "stopped")
                                        if (!sentNotif) console.log("Failed to send notification!")
                                    }

                                    actionedScripts.push(script);
                                }
                            }
                        }

                        return res.status(200).json({
                            status: 200,
                            actionedScripts
                        })
                    }
                })
            }
        })
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: "Failed to perform script action",
        });
    }
}

export default {
    PowerControl
}
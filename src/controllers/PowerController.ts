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
        if (!req.body || !req.body.script || !req.body.action) {
            return res.status(400).json({
                status: 400,
                message: "Missing body parameters"
            })
        }
    }

    try {
        const scriptName = (req.body.script || req.webhook_payload?.repository.name);

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
                        if (proc.filter((v) => v.name === scriptName).length <= 0) {
                            return res.status(404).json({
                                status: 404,
                                message: "That script does not exist on the server"
                            })
                        } else {
                            if (req.body.action === "restart" || req.body.action === "start" || isFromGitHub) {
                                pm2.restart(scriptName, (err) => {
                                    if (err) throw err
                                });
                
                                if (process.env.NOTIFICATIONS_ENABLED) {
                                    const sentNotif = await NotificationManager.SendNotification(scriptName, "restarted")
                                    if (!sentNotif) console.log("Failed to send notification!")
                                }
                            } else if (req.body.action === "stop") {
                                pm2.stop(req.body.script, (err) => {
                                    if (err) throw err
                                });
                
                                if (process.env.NOTIFICATIONS_ENABLED) {
                                    const sentNotif = await NotificationManager.SendNotification(scriptName, "stopped")
                                    if (!sentNotif) console.log("Failed to send notification!")
                                }
                            } else {
                                return res.status(400).json({
                                    status: 400,
                                    message: "Invalid body parameter supplied"
                                })
                            }

                            return res.status(200).json({
                                status: 200,
                                message: "Successfully performed script action"
                            })
                        }
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
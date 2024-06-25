import pm2 from 'pm2';
import NotificationManager from '../services/NotificationManager';
import type { Request, Response } from 'express';

const PowerControl = async function(
    req: Request,
    res: Response
) {
    if (
        !req.body
        || !req.body.script
        || !req.body.action
    ) {
        return res.status(400).json({
            status: 400,
            message: "Invalid/missing body parameters"
        })
    }

    try {
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
                        if (proc.filter((v) => v.name === req.body.script).length <= 0) {
                            return res.status(404).json({
                                status: 404,
                                message: "That script does not exist on the server"
                            })
                        } else {
                            if (req.body.action === "restart" || req.body.action === "start") {
                                pm2.restart(req.body.script, (err) => {
                                    if (err) throw err
                                });
                
                                if (process.env.NOTIFICATIONS_ENABLED) {
                                    const sentNotif = await NotificationManager.SendNotification(req.body.script, "restarted")
                                    if (!sentNotif) console.log("Failed to send notification!")
                                }
                            } else if (req.body.action === "stop") {
                                pm2.stop(req.body.script, (err) => {
                                    if (err) throw err
                                });
                
                                if (process.env.NOTIFICATIONS_ENABLED) {
                                    const sentNotif = await NotificationManager.SendNotification(req.body.script, "stopped")
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
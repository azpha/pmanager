const pm2 = require('pm2');
const NotificationManager = require('../services/NotificationManager');

const PowerControl = async function(req,res) {
    if (!req.body || !req.body.script || !req.body.action) return res.status(400).json({
        status: 400,
        message: "Invalid body parameters"
    })

    if (req.body.action.toLowerCase() !== "restart" && 
    req.body.action.toLowerCase() !== "stop" &&
    req.body.action.toLowerCase() !== "start") {
        return res.status(400).json({
            status: 400,
            message: "Invalid power action"
        })
    }

    try {
        pm2.connect(async function(err) {
            if (err) throw err;

            // perform power actions
            if (req.body.action == "restart" || req.body.action == "start") {
                pm2.restart(req.body.script, (err,proc) => {
                    if (err) throw err;
                })

                if (process.env.NOTIFICATIONS_ENABLED) {
                    let sentNotification = await NotificationManager.SendNotification(req.body.script, "restarted")
                    if (!sentNotification) console.log("Failed to send notification!")
                }
            } else if (req.body.action == "stop") {
                pm2.stop(req.body.script, (err) => {
                    if (err) throw err;
                })

                if (process.env.NOTIFICATIONS_ENABLED) {
                    let sentNotification = await NotificationManager.SendNotification(req.body.script, "stopped")
                    if (!sentNotification) console.log("Failed to send notification!")
                }
            }

            // disconnect from pm2 after finished
            pm2.disconnect();
        })

        return res.status(200).json({
            status: 200,
            message: "Successfully started script"
        })
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: "Failed to start script",
            error: e.message
        });
    }
};

const ScriptStatus = async function(req,res) {
    try { 
        pm2.connect((err) => {
            if (err) throw err;

            pm2.list((err, list) => {
                if (err) throw err;
                const valid_list = [];

                for (const item of list) {
                    const schema = {
                        name: item["name"],
                        status: item["pm2_env"]["status"],
                        processInfo: {
                            pmId: item["pm_id"],
                            processId: item["pid"],
                            uniqueId: item["pm2_env"]["unique_id"],
                            usage: {
                                memory: item["monit"]["memory"],
                                cpu: item["monit"]["cpu"]
                            }
                        },
                        env: {
                            createdAt: item["pm2_env"]["created_at"],
                            uptime: item["pm2_env"]["pm_uptime"]
                        }
                    }

                    if (req.query.script) {
                        if (schema["name"] == req.query.script) {
                            valid_list.push(schema)
                        }
                    } else {
                        valid_list.push(schema)
                    }
                }

                return res.status(200).json({
                    status: 200,
                    processList: valid_list
                })
            })
        })
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: "Failed to fetch script status",
            error: e.message
        });
    }
}

module.exports = {
    PowerControl,
    ScriptStatus
}
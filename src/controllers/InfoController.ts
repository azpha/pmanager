import pm2 from 'pm2';
import type { Script } from '../utils/types';
import type { Request, Response } from 'express';

const GetScriptInfo = async function (
    req: Request,
    res: Response
) {
    try {
        pm2.connect((err) => {
            if (err) throw err;

            pm2.list((err, list) => {
                if (err) throw err;

                if (req.query.script) {
                    const item = list.filter((v) => v.name === req.query.script);

                    return res.status(200).json({
                        status: 200,
                        processList: item
                    })
                } else {
                    const validList = [];
                    for (const item of list) {
                        const schema = {
                            name: item.name,
                            status: item.pm2_env?.status,
                            processInfo: {
                                pmId: item.pm_id,
                                processId: item.pid,
                                usage: {
                                    memory: item.monit?.memory,
                                    cpu: item.monit?.cpu
                                },
                            },
                            env: {
                                uptime: item.pm2_env?.pm_uptime,
                            }
                        } as Script

                        validList.push(schema)
                    }

                    return res.status(200).json({
                        status: 200,
                        processList: validList
                    })
                }
            })
        })
    } catch (e) {
        return res.status(500).json({
            status: 500,
            message: "Failed to fetch script info"
        })
    }
}

export default {
    GetScriptInfo
}
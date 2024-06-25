import fetch from 'node-fetch';
import WebhookObjectBuilder from '../utils/WebhookObjectBuilder';

const SendNotification = async (
    scriptName: string, 
    notificationType: "restarted" | "stopped"
) => {
    let url = process.env.DISCORD_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL
    let notificationProvider = url?.includes("https://discord.com") ? "discord" : url?.includes("https://hooks.slack.com") ? "slack" : null

    if (!notificationProvider || !url) return false; // don't continue if provider is unsupported
    let object = WebhookObjectBuilder.BuildDiscordEmbed(scriptName, notificationType)

    // get embed post object for set provider
    // let object = notificationProvider == "discord" ? 
    //     WebhookObjectBuilder.BuildDiscordEmbed(scriptName, notificationType) : 
    //     WebhookObjectBuilder.BuildSlackEmbed(scriptName, notificationType)

    if (object) {
        const embedPostResponse = fetch(url, {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify(object)
        }).then(async (res) => {
            return res.status == 200 || res.status == 204;
        }).catch(() => {
            return false;
        })

        return embedPostResponse
    } else return false;
}

export default {
    SendNotification
}
import type {
    DiscordWebhookPayload
} from './types';

const BuildDiscordEmbed = function(scriptName: string, notificationType: "restarted" | "stopped") {
    if (!process.env.DISCORD_USERNAME) return false;
    const date = new Date()

    const object = {
        "username": process.env.DISCORD_USERNAME,
        "embeds": [
            {
                title: "Script restarted!",
                description: `Your script, **${scriptName}**, was **${notificationType}**!`,
                footer: {
                    text: `PManager at ${date.toISOString()}`
                }
            }
        ]
    } as DiscordWebhookPayload

    if (process.env.DISCORD_AVATAR) object["avatar_url"] = process.env.DISCORD_AVATAR_URL
    return object;
}
// const BuildSlackEmbed = function(processObject) {

// }

export default {
    BuildDiscordEmbed,
    // BuildSlackEmbed
}
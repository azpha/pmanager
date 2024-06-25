// Discord webhook types
type DiscordWebhookPayload = {
    username: string,
    avatar_url?: string,
    embeds: DiscordWebhookEmbed[]
}
type DiscordWebhookEmbed = {
    title: string,
    description: string,
    footer: {
        text: string
    }
}

// pm2 scripts
type Script = {
    name: string,
    status: string,
    processInfo: {
        pmId: number,
        processId: number,
        uniqueId: string
        usage: {
            memory: number,
            cpu: number
        }
    },
    env: {
        createdAt: number,
        uptime: number
    }
}

export type {
    DiscordWebhookEmbed,
    DiscordWebhookPayload,
    Script
}
# PManager
Just a small web server I wrote for fun to control my PM2 containers on my homelab

## Installation
```bash
git clone https://github.com/azpha/pmanager
cd pmanager
npm i
```

## Configuration
Copy `.env.sample` to another file and name it `.env`, then make your changes

## Notifications
You can setup Discord or Slack notifications for when a power action is performed; make sure you only set **one** and remove the options for the other or you might see unexpected behavior where it goes to the incorrect one.

## Sending Power Notifications
```
curl -d '{"action": "restart/stop/start", "script": "pm2-script-name"}' -h "Content-Type: application/json" -X POST http://your.domain/power/status?secret=yoursecret
```
- action: the power action to perform, start/restart/stop
- script: the name you gave your script in PM2
- secret: the secret you set in .env

## Seeing status of created scripts
```
curl http://your.domain/power/status?script=script
```
- script: optional parameter to only see the status of one script
Update t3 NextJs package:
`pnpm i @t3-oss/env-nextjs@latest`

Update Zod in package.json to 4.1.13

`pnpm i corsair @corsair-dev/gmail @corsair-dev/googlecalendar @corsair-dev/cli`

Create new project in Google Console: `https://console.cloud.google.com/projectcreate`

To set up Gmail Client ID and Client Secret:
`pnpm corsair setup --gmail client_id=CLIENT_ID client_secret=CLIENT_SECRET`

To set up Google Calendar Client ID and Client Secret (do it with same client id and same client secret as Gmail):
`pnpm corsair setup --googlecalendar client_id=CLIENT_ID client_secret=CLIENT_SECRET`

> Make sure to enable API for Gmail and Google Calendar both

To set up access + refresh token for your tenant:
`pnpm corsair auth --plugin=gmail --tenant=dev` (you can put any tenant id; I put dev)
`pnpm corsair auth --plugin=googlecalendar --tenant=dev` (you can put any tenant id; I put dev)

After each one, click the URL adn then run the follow-up command to collect the tokens

For webhook setup:

`pnpm corsair auth --plugin=gmail --webhooks`
`pnpm corsair auth --plugin=googlecalendar --webhooks`


Be sure to set up Ngrok and point it at your localhost URL
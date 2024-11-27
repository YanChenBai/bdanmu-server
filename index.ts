import { App, type Request, type Response } from '@tinyhttp/app'
import { logger } from '@tinyhttp/logger'
import { cors } from '@tinyhttp/cors'

const BliveApi = 'https://api.live.bilibili.com'

function getApi(base: string, path: string) {
  base = base.endsWith('/') ? base.substring(0, base.length - 1) : base
  return base + (path.startsWith('/') ? path : '/' + path)
}

const SERVER_ERROR = {
  code: 50000,
  msg: "请求失败",
  message: "请求失败",
  data: null
}

function reqHasRoomId(req: Request, res: Response) {
  const roomId = req.query['roomId'] as string | undefined

  if (!roomId) {
    res.status(400).json({
      code: 60004,
      msg: "直播间不存在",
      message: "直播间不存在",
      data: null
    })
    return null
  } else {
    return roomId
  }
}

function proxyHttp(res: Response, input: string | URL | globalThis.Request, init?: RequestInit) {
  fetch(input, init)
    .then(resp => resp.json())
    .then(resp => res.json(resp))
    .catch(() => {
      res.status(500).json(SERVER_ERROR)
    })
}

const app = new App()

app
  .use(logger())
  .use(cors({
    origin: "*",
    methods: ['GET', 'POST']
  }))

app.get('/', (_, res) => res.send('ok.'))

app.get('/room/v1/Danmu/getConf', (req, res) => {
  const roomId = reqHasRoomId(req, res)
  if (!roomId) return

  proxyHttp(res, getApi(BliveApi, `/room/v1/Danmu/getConf?room_id=${roomId}&platform=pc&player=web`))
})

/** 获取完整RommId */
app.get('/room/v1/Room/mobileRoomInit', (req, res) => {
  const roomId = reqHasRoomId(req, res)
  if (!roomId) return

  proxyHttp(res, getApi(BliveApi, `/room/v1/Room/mobileRoomInit?id=${roomId}`))
})

app.listen(3000, () => console.log('Listening on http://localhost:3000'))
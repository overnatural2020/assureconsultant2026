// Ultra-minimal test — no external dependencies, no db
import http from 'node:http'

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Express': 'minimal-test',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify({ ok: true, url: req.url, node: process.version, pid: process.pid, ts: Date.now() }))
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  process.stderr.write('minimal-test listening on port ' + PORT + '\n')
})

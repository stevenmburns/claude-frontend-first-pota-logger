#!/usr/bin/env node
// Tiny proxy that forwards XML-RPC to flrig and adds CORS + Private Network Access headers.
// Usage: node flrig-proxy.js
// Env vars: FLRIG_PROXY_PORT (default 12346), FLRIG_HOST (default localhost), FLRIG_PORT (default 12345)

import http from 'node:http'

const PROXY_PORT = parseInt(process.env.FLRIG_PROXY_PORT ?? '12346', 10)
const FLRIG_HOST = process.env.FLRIG_HOST ?? 'localhost'
const FLRIG_PORT = parseInt(process.env.FLRIG_PORT ?? '12345', 10)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Private-Network': 'true',
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS)
    res.end()
    return
  }

  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    const body = Buffer.concat(chunks)
    const options = {
      hostname: FLRIG_HOST,
      port: FLRIG_PORT,
      path: '/',
      method: 'POST',
      headers: { 'Content-Type': 'text/xml', 'Content-Length': body.length },
    }
    const proxy = http.request(options, upstream => {
      const parts = []
      upstream.on('data', d => parts.push(d))
      upstream.on('end', () => {
        res.writeHead(upstream.statusCode ?? 200, { ...CORS_HEADERS, 'Content-Type': 'text/xml' })
        res.end(Buffer.concat(parts))
      })
    })
    proxy.on('error', err => {
      res.writeHead(502, CORS_HEADERS)
      res.end(`flrig unreachable: ${err.message}`)
    })
    proxy.end(body)
  })
})

server.listen(PROXY_PORT, () => {
  console.log(`flrig proxy listening on :${PROXY_PORT} → ${FLRIG_HOST}:${FLRIG_PORT}`)
})

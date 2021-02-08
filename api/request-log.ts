import { NowRequest, NowRequestCookies, NowRequestQuery, NowResponse } from '@vercel/node'
import { UserData } from 'auth0';
import { IncomingHttpHeaders } from 'http2';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

type LogEntry = {
  statusCode: number
  tenant: string
  context: Record<string, unknown>
  user: UserData,
  ruleIp: string | string[]
  ruleUserAgent: string
  request: {
    "headers": IncomingHttpHeaders
    "query": NowRequestQuery
    "cookies": NowRequestCookies
  }
}

const LogEntry = new Schema({
  date: { type: Date, default: Date.now },
  tenant: { type: String, default: 'unknown', index: true },
  ruleIp: { type: String },
  header: { type: Object, index: true },
  ruleUserAgent: {type: String},
  request: { type: Object},
  statusCode: {type: Number},
  context: {type: Object, index: true},
  user: {type: Object, index: true}
});

const Log = mongoose.model('LogEntry', LogEntry);

export default async (request: NowRequest, response: NowResponse) => {
  // TODO: validate body
  const { tenant = 'unknown', context, user } = JSON.parse(request.body)

  const logResponse: LogEntry = {
    statusCode: response.statusCode,
    tenant,
    context,
    user,
    ruleIp: request.headers["x-real-ip"],
    ruleUserAgent: request.headers["user-agent"],
    request: {
      headers: request.headers,
      query: request.query,
      cookies: request.cookies
    }
  }

  // TODO: Catch errors
  await mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })

  const newLogEntry: mongoose.Document<LogEntry> = new Log(logResponse);
  console.info("Saving this entry", newLogEntry)
  
  // TODO: Catch errors
  newLogEntry.save({checkKeys: false}, err => {
    if (err) return console.error(err);
    console.info("SUCCESS")
    response.status(200).send(logResponse)
  })

}

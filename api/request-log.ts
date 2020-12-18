import { NowRequest, NowResponse } from '@vercel/node'
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

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
  const { tenant = 'unknown', context, user } = JSON.parse(request.body)

  const logResponse = {
    "statusCode": response.statusCode,
    tenant,
    context,
    user,
    "ruleIp": request.headers["x-real-ip"],
    "ruleUserAgent": request.headers["user-agent"],
    "request": {
      "headers": request.headers,
      "query": request.query,
      "cookies": request.cookies
    }
  }
  
  // TODO: Place this logReponse a database

    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })

  const newLogEntry = new Log(logResponse);

  newLogEntry.save({checkKeys: false}, function (err) {
    if (err) return console.error(err);
    response.status(200).send(logResponse)
  })

}

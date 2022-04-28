import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import EntryPoint from './entrypoint.js';
import BitcoinAsync from './bitcoinasync.js';
import Click2Call from './click2call.js';
import PhoneMenu from './phonemenu.js';

const app = express();
const port = 80;

app.use(cors())
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));

/* All inbound calls are sent to this endpoint */
app.post('/entrypoint', EntryPoint.route);

/* Bitcoin price (async) scenario endpoints */
app.post('/bitcoinasync/price', BitcoinAsync.price);

/* Click to call scenario endpoints */
app.get('/click2call/initiate', Click2Call.initiate);
app.post('/click2call/office/answer', Click2Call.officeAnswer);
app.post('/click2call/visitor/call', Click2Call.visitorCall);
app.post('/click2call/ringback', Click2Call.ringback);
app.post('/click2call/visitor/answer', Click2Call.visitorAnswer);

/* Phone menu scenario endpoints */
app.post('/phonemenu/bogus', PhoneMenu.bogus);
app.post('/phonemenu/dept', PhoneMenu.dept);
app.post('/phonemenu/moh', PhoneMenu.moh);
app.post('/phonemenu/cs/bogus', PhoneMenu.csBogus);
app.post('/phonemenu/cs/route', PhoneMenu.csRoute);
app.post('/phonemenu/sales/bogus', PhoneMenu.salesBogus);
app.post('/phonemenu/sales/route', PhoneMenu.salesRoute);

app.listen(port, () => {
    console.log('Eqivo sandbox backend up & running');
});

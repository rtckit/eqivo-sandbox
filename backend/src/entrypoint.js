import url from 'url';
import client from './client.js';
import Bitcoin from './bitcoin.js';
import BitcoinAsync from './bitcoinasync.js';
import PhoneMenu from './phonemenu.js';

export default class EntryPoint {
    static async route(req, res) {
        /* All extensions used by these scenarios are integers. However, extensions are not limited to digits only.
         */
        const number = parseInt(req.body.To);

        /* The actual router */
        switch (number) {
            case 2001:
                return PhoneMenu.answer(req, res);

            case 2002:
                return Bitcoin.answer(req, res);

            case 2003:
                return BitcoinAsync.answer(req, res);

            /* Oops, we don't recognize this extension! */
            default:
                const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/the_number_you_have_dialed_is_not_in_service.wav</Play>
    <Hangup reason="rejected" />
</Response>`;

                res.type('application/xml').status(200).send(restXml);
        }
    }
}

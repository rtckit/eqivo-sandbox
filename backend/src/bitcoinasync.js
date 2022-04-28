import axios from 'axios';
import url from 'url';
import client from './client.js';

export default class BitcoinAsync {
    /**
     * Unlike bitcoin.js, let's make this more caller friendly by playing the initial
     * part of the read back while concurrently we're fetching the bitcoin price.
     */
    static async answer(req, res) {
        /* Collect the current timestamp */
        const now = Date.now();

        /* Issue the API call (note the missing await statement) */
        axios.get('https://api.coinbase.com/v2/prices/BTC-USD/buy')
            .then(function (response) {
                /* Figure out how much time has elapsed */
                const delta = Date.now() - now;

                /* We want the entire greeting to be played back (it's approximately 2 seconds long) */
                const timeout = (delta >= 2000) ? 0 : 2000 - delta;

                /* Now that we have the price, tell Eqivo to redirect the call to a new RestXML URL.
                 * Learn more about the TransferCall API request here: https://eqivo.org/#v0-1-transfercall
                 */
                setTimeout(function () {
                    client.post('TransferCall/', new url.URLSearchParams({
                        CallUUID: req.body.CallUUID,
                        Url: "http://backend/bitcoinasync/price?quote=" + parseInt(response.data.data.amount),
                    }))
                    .catch(function (error) {
                        console.error(error);
                    });
                }, timeout);
            })
            .catch(function (error) {
                console.error(error);
            });

        /* Prepare the "greeting" */
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/bitcoin/the_current_price_of_bitcoin_is.wav</Play>

    <!-- In case our coinbase API call is delayed, keep the call alive until we have a response. -->
    <Wait length="60" />
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Invoked when the bitcoin price has been retrieved and the initial greeting has been played
     */
    static async price(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak type="CURRENCY">${req.query.quote}</Speak>
    <Play>http_cache://http://frontend/audio/bitcoin/us_dollars.wav</Play>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }
}

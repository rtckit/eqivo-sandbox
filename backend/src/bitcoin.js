import axios from 'axios';

export default class Bitcoin {
    /* Fetch the bitcoin price from coinbase, then immediately read it back) */
    static async answer(req, res) {
        var price = 0;

        /* Caveat emptor: the caller hears nothing until this API call completes!
         * See bitcoinasync.js for a more comprehensive solution.
         */
        await axios.get('https://api.coinbase.com/v2/prices/BTC-USD/buy')
            .then(function (response) {
                price = parseInt(response.data.data.amount);
            })
            .catch(function (error) {
                console.error(error);
            });

        /* Read back the bitcoin price by using Play and Speak elements:
         *
         * - Play https://eqivo.org/#play
         * - Speak https://eqivo.org/#speak
         */
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/bitcoin/the_current_price_of_bitcoin_is.wav</Play>
    <Speak type="CURRENCY">${price}</Speak>
    <Play>http_cache://http://frontend/audio/bitcoin/us_dollars.wav</Play>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }
}

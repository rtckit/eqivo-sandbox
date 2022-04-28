import url from 'url';
import client from './client.js';

export default class Click2Call {
    /**
     * Kicks off the Click to call scenario; the very first step is to call the office number
     */
    static async initiate(req, res) {
        const officeNumber = '1002@localhost';

        /* Fire up the new Call Eqivo API request
         * Complete documentation at https://eqivo.org/#v0-1-call
         */
        const result = await client.post('Call/', new url.URLSearchParams({
            From: req.query.customerNumber,
            CallerName: req.query.customerNumber,
            To: officeNumber,
            Gateways: "user/",
            AnswerUrl: "http://backend/click2call/office/answer",
        })).catch(function (error) {
            console.log(error);
            res.status(200).json({
                success: false,
                message: error,
            });

            return;
        });

        /* Make sure everything went fine */
        if (!result.data || !result.data.Success) {
            res.status(200).json({
                success: false,
                message: result.data.Message,
            });

            return;
        }

        /* Relay the result */
        res.status(200).json({
            success: true,
            message: result.data.Message,
        });
    }

    /**
     * Invoked when the office picks up the initial call.
     */
    static async officeAnswer(req, res) {
        /* Tell Eqivo to play an explanatory prompt, then redirect to the actual bridge attempt
         * We achieve this by assembling a RestXML response consisting of the following Elements:
         *
         * - Play https://eqivo.org/#play
         * - Speak https://eqivo.org/#speak
         * - Redirect https://eqivo.org/#redirect
         */
        const spelled = req.body.From.split('').join(' ');
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/click2call/you_received_a_click_to_call_request_from.wav</Play>
    <Speak type="TELEPHONE_NUMBER">${spelled}</Speak>
    <Play>http_cache://http://frontend/audio/click2call/please_wait_while_we_connect_you.wav</Play>
    <Redirect>http://backend/click2call/visitor/call</Redirect>
</Response>`;

        /* Send the RestXML response to Eqivo! */
        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Spawns an outbound call to the visitor
     */
    static async visitorCall(req, res) {
        /* Attempt to bridge the office with the visitor via the Conference element and another Call API request
         * https://eqivo.org/#conference
         */
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Conference stayAlone="false" waitSound="http://backend/click2call/ringback">click2call</Conference>
</Response>`;

        res.type('application/xml').status(200).send(restXml);

        /* Initiate the outbound call to the visitor */
        client.post('Call/', new url.URLSearchParams({
            From: req.body.To,
            CallerName: req.body.To,
            To: req.body.From + '@localhost',
            Gateways: "user/",
            AnswerUrl: "http://backend/click2call/visitor/answer",
        })).catch(function (error) {
            console.log(error);
        });
    }

    /**
     * Plays back a ringback tune
     */
    static async ringback(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/ringback.wav</Play>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Bridges the visitor with the office
     */
    static async visitorAnswer(req, res) {
        /* Now that the visitor has picked up, throw them in the same Conference with the office
         * https://eqivo.org/#conference
         */
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Conference stayAlone="false">click2call</Conference>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }
}

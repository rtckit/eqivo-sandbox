import url from 'url';
import client from './client.js';

export default class PhoneMenu {
    /**
     * Invoked when new calls are being answered
     *
     * The logic is implemented vis Play, GetDigits and Redirect elements
     *
     * - Play https://eqivo.org/#play
     * - GetDigits https://eqivo.org/#getdigits
     * - Redirect https://eqivo.org/#redirect
     */
    static async answer(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/phonemenu/thank_you_for_calling_the_sandbox_company.wav</Play>
    <Play>http_cache://http://frontend/audio/phonemenu/lets_gather_some_information_to_serve_you_better.wav</Play>

    <!-- GetDigits will POST matched digits to the action URL below -->
    <GetDigits action="http://backend/phonemenu/dept" numDigits="1" timeout="4" validDigits="12" playBeep="true">
        <Play>http_cache://http://frontend/audio/phonemenu/for_sales_press_1_for_customer_service_press_2.wav</Play>
    </GetDigits>

    <!-- If there are no matching digits, the execution flow continues to the next element -->
    <Redirect>http://backend/phonemenu/bogus</Redirect>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Called when bogus/no DTMF tones are received in the initial menu
     */
    static async bogus(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/phonemenu/im_sorry_i_didnt_get_that.wav</Play>
    <GetDigits action="http://backend/phonemenu/dept" numDigits="1" timeout="4" validDigits="12" playBeep="true">
        <Play>http_cache://http://frontend/audio/phonemenu/for_sales_press_1_for_customer_service_press_2.wav</Play>
    </GetDigits>
    <Redirect>http://backend/phonemenu/bogus</Redirect>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Called when a department selection has been received
     */
    static async dept(req, res) {
        /* At this point, we should have DTMF input in the `Digits` parameter */
        if (!req.body.Digits) {
            PhoneMenu.bogus(req, res);
        }

        switch (parseInt(req.body.Digits)) {
            case 1:
                return PhoneMenu.jump2sales(req, res);

            case 2:
                return PhoneMenu.jump2cs(req, res);

            default:
                return PhoneMenu.bogus(req, res);
        }
    }

    /**
     * Invoked when the caller chose Sales
     */
    static async jump2sales(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <GetDigits action="http://backend/phonemenu/sales/route" numDigits="1" timeout="4" validDigits="12" playBeep="true">
        <Play>http_cache://http://frontend/audio/phonemenu/for_special_offers_press_1_for_the_latest_and_greatest_press_2.wav</Play>
    </GetDigits>
    <Redirect>http://backend/phonemenu/sales/bogus</Redirect>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Invoked when the caller doesn't choose a correct Sales option
     */
    static async salesBogus(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/phonemenu/im_sorry_i_didnt_get_that.wav</Play>
    <GetDigits action="http://backend/phonemenu/sales/route" numDigits="1" timeout="4" validDigits="12" playBeep="true">
        <Play>http_cache://http://frontend/audio/phonemenu/for_special_offers_press_1_for_the_latest_and_greatest_press_2.wav</Play>
    </GetDigits>
    <Redirect>http://backend/phonemenu/sales/bogus</Redirect>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Invoked when the caller has choosen a correct Sales option
     */
    static async salesRoute(req, res) {
        /* In this example we'll not really route the call to an associate ...
         * Let's play a prompt and throw the caller in an empty conference.
         */
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/phonemenu/please_wait_while_we_connect_you_to_a_specialist.wav</Play>
    <Conference stayAlone="false" waitSound="http://backend/phonemenu/moh">sales${req.body.Digits}</Conference>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Invoked when the caller chose Customer Service
     */
    static async jump2cs(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <GetDigits action="http://backend/phonemenu/cs/route" numDigits="1" timeout="4" validDigits="12" playBeep="true">
        <Play>http_cache://http://frontend/audio/phonemenu/for_technical_support_press_1_for_billing_press_2.wav</Play>
    </GetDigits>
    <Redirect>http://backend/phonemenu/cs/bogus</Redirect>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Invoked when the caller doesn't choose a correct Customer Service option
     */
    static async csBogus(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/phonemenu/im_sorry_i_didnt_get_that.wav</Play>
    <GetDigits action="http://backend/phonemenu/cs/route" numDigits="1" timeout="4" validDigits="12" playBeep="true">
        <Play>http_cache://http://frontend/audio/phonemenu/for_technical_support_press_1_for_billing_press_2.wav</Play>
    </GetDigits>
    <Redirect>http://backend/phonemenu/cs/bogus</Redirect>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Invoked when the caller has choosen a correct Customer Service option
     */
    static async csRoute(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/phonemenu/please_wait_while_we_connect_you_to_a_specialist.wav</Play>
    <Conference stayAlone="false" waitSound="http://backend/phonemenu/moh">cs{req.body.Digits}</Conference>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }

    /**
     * Defines the music-on-hold
     */
    static async moh(req, res) {
        const restXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>http_cache://http://frontend/audio/moh.wav</Play>
    <Play>http_cache://http://frontend/audio/phonemenu/thank_you_for_holding.wav</Play>
</Response>`;

        res.type('application/xml').status(200).send(restXml);
    }
}

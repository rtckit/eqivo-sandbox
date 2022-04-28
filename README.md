# Sample Programmable Voice scenarios built with Eqivo

Given the fairly complex nature of VoIP, integrating against applications such as [Eqivo](https://eqivo.org) is not always as straightforward, especially when compared against modern day web services. One has to configure at least a FreeSWITCH instance (for signalling and media handling) and then integrate their backend against Eqivo.

The purpose of this repository is to demonstrate how one can integrate against Eqivo through a set of simple real life inspired scenarios.

### Assumptions

This sample project is built around Docker Compose, allowing the reader to understand how various components interact with each other as well to rapidly provide a known working setup.

The running machine is expected to have `docker` and `docker-compose` installed and the provided frontend is expected to be accessed via `localhost` only, to avoid running into problems with TLS and DNS. This is of course _not_ what you want in production yet application orchestration is out of scope as far as this project goes.

The provided configuration is known to work out of the box at least in mainstream Linux distributions.

### Getting started

First, clone (or even fork!) this repository:

```sh
git clone https://github.com/rtckit/eqivo-sandbox.git
```

Then pull the necessary Docker images:

```sh
docker-compose -p sandbox -f etc/docker-compose.yaml pull
```

Then fire up your Docker Compose cluster!

```sh
docker-compose -p sandbox -f etc/docker-compose.yaml up
```

Once the cluster is up, navigate to [http://localhost:8081/](http://localhost:8081/) and follow the displayed directions.

### Customize

You can implement your own scenarios or edit the provided ones.

The backend and frontend are configured to use a local volume mount so you can modify their respective source code files and your changes will be immediately available. To an extent, that's the case for the FreeSWITCH configuration though you will be expected to issue a `reloadxml` command and perhaps reload affected modules.

### Caveat emptor

The provided configuration is not meant to be the basis for a production application, instead the emphasis is solely on how to integrate against Eqivo. Chances are you will integrate Eqivo against an existing backend or framework and all known best practice must be exercised here too. Deliberately left out of the sample but critical in production are proper user input sanitation, URL and XML encoding just to name a few.

## License

CC0, see [LICENSE file](LICENSE).

### Acknowledgments

* [Bootstrap](https://getbootstrap.com/) - Used by the frontend
* [JsSIP](https://jssip.net/) - SIP over WebSockets library used by the demo web phone (to simulate PSTN interactions)
* [FreePD](https://freepd.com/) - Public domain audio tracks used as music-on-hold
* [coinbase](https://developers.coinbase.com/api/v2#get-sell-price) - API service used by a simple Bitcoin price scenario
* [Watson](https://www.ibm.com/watson) - Used to generate voice prompts used by the provided scenarios
* [FreeSWITCH](https://github.com/signalwire/freeswitch) - Handles the real time communications aspects, particularly signalling and media processing
* [Eqivo](https://github.com/rtckit/eqivo) - Eqivo itself!

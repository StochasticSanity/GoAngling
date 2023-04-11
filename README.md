# GoAngling

A [kludge](http://catb.org/jargon/html/K/kluge.html) of [evilginx2](https://github.com/kgretzky/evilginx2) and [GoPhish](https://github.com/gophish/gophish) with spinkles from [sneaky_gophish](https://github.com/puzzlepeaches/sneaky_gophish) and [evilgophish](https://github.com/fin3ss3g0d/evilgophish)

This project has been battle-tested in development for months. It has undergone heavy modification prior to public release, and now it's available for others to use.

Please note that this repository is tailored to specific use cases, and its configuration is mainly designed to align with my preferred workflow. It may not be highly portable for other users. Feel free to fork the project and modify it according to your needs.

## Disclaimer

This software is provided "as-is", without any warranty, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the author be liable for any claim, damages, or other liability arising from the use or distribution of this software. It is the user's responsibility to ensure that the software is used in compliance with all applicable laws and regulations.

This work does not reflect the views or opinions of my employers, past or present, and they are not liable for any use or misuse of this software.

## Rationale


Both EvilGinx2 and GoPhish have been valuable tools for phishing campaigns, with each serving a unique purpose:

- GoPhish is designed with an "Audit" mindset, providing excellent metrics, a visually appealing interface, and is ideal for running awareness campaigns.
- EvilGinx2 is designed with an "Attack" mindset, offering robust functionality, including the ability to capture MFA tokens, making it suitable for red team engagements and other purposes.
- 
However, a middle ground was necessary to achieve my goals. I aimed to combine EvilGinx2's powerful capabilities with GoPhish's comprehensive metrics, enhance GoPhish by adding MFA token handling, simplify the setup process with an easy-to-use script, integrate external banlists, and address a limitation of EvilGinx2 related to session creation when the victim comes from the same lure path and/or IP address.

In summary, the goal was to create a more efficient and effective phishing tool for ethical purposes.




## How it works

GoPhish is used as a dashboard for Evilginx campaign statistics and to send emails. The phishing links point to an evilginx2 lure, and evilginx2 updates the GoPhish database with any Opens, Clicks, Submits, or Captures. A web server (Apache or Nginx) facilitates this with more robust banlist configuration and adds an additional battle-tested hardening layer to the infrastructure.

- The web server runs externally on port 443 and proxies connections to evilginx2.
- Evilginx2 runs locally on port 8443 and handles incoming requests.
- GoPhish runs locally on port 8080 and externally on port 3000, providing the UI to interact with the campaign after initial setup.

Please note that you should not expose port 3000 to the public internet. In my use case, my firewall is configured to block all ports except 443, and port 3000 has an IP whitelist at the firewall layer. This setup should not be used if you're not confident in your firewall rules.

## Modifications
### GoPhish
- The default `rid` string has been changed to `client_id` and can be modified through the `setup.sh` script.
- Landing Pages have been removed entirely.
- All Indicators of Compromise (IOCs) have been stripped, as seen in  [sneaky_gophish](https://github.com/puzzlepeaches/sneaky_gophish)

### evilginx2
- CORS headers have been removed from responses.
- "Easter eggs" have been removed.
- All whitelisting functionality has been eliminated.
- Output to the GoPhish Database has been added.
- The configuration directory has been hardcoded to the local directory, the same as phishlets.



## Setup

You can either modify the `conf.yaml` file and run `setup.sh` or provide the following command-line parameters:

```
sage: setup.sh <domain> <subdomains> <root_redirect> <redirect_url> <rid_value>

Arguments:
<domain>                The domain to be used for the campaign as a string.
<subdomains>            A space-separated list of subdomains.
<root_redirect>         Whether or not the root domain should redirect to redirect_url. (true/false)
<redirect_url>          The URL to redirect unauthorised requests.
<rid_value>             The value for a parameter called 'rid', which defaults to 'client_id'.

Example: ./setup.sh acme.co "test1 test2" true example.com acme_id
```

The `conf.yaml` file is provided for unattended setup and serves as a record of how this instance was set up if used. 

## Campaign Setup

The initial campaign setup is nearly identical to using these tools normally, except GoPhish will utilize an evilginx2 lure.

- Start GoPhish by running `./gophish`
- Start evilginx2 by running `./evilginx2`
- Configure evilginx2  as usual
- Ensure your webserver is running (Setup script should start it automatically)
- Configure your Groups and Templates in GoPhish
- Launch your campaign using the evilginx2 lure as the URL. 

## Customization Options

You can primarily find settings to modify in the `conf.yaml`, `setup.sh`, or the `config` directory. However, feel free to explore the code and make any additional changes as needed.


## Phishlets

The phishlets designed by [Dylan Evans](https://github.com/fin3ss3g0d) have been included as they are not part of the original release. If requested, they may be removed at a later time, and you will need to find your own.

## Issues and Support

This project was developed primarily for personal enjoyment. As a result, responses to most issues may be limited unless they have already been fixed or warrant attention.

# TODO

This code was heavily modified before release, so I expect there are some issues with it. I'll try to iron those out as I find them. 
 - Encorporate the fixes from evilgophish related to JSON tokens, mime types and bad headers. 
 - Add some more tools to the repo for generating banlists. 

## Future Improvements

As the code was heavily modified before release, some issues may arise. Efforts will be made to address these as they are discovered.

- Integrate fixes from evilgophish related to JSON tokens, MIME types, and bad headers.
- Add more tools to the repo for generating banlists.

## Acknowledgements

This repository would not exist without the contributions of talented [hackers](http://www.catb.org/jargon/html/H/hacker.html).

> The subject is magnificent, the backdrop... jaw dropping... but, the agent of beauty is a talentless fool

Full credit goes to:
- [Kuba Gretzky](https://github.com/kgretzky), the author of the amazing evilginx2
- [Jordan Wright](https://github.com/jordan-wright), the author of the beautiful GoPhish
- [Dylan Evans](https://github.com/fin3ss3g0d), who worked towards the same goal, and ended up (unknowingly) fixing much of the original code
- [Nicholas Anastasi](https://github.com/puzzlepeaches), who inspired this project by encouraging exploration of GoPhish's code
- [Dan Borges](https://github.com/ahhh), whose solution via Docker led to the integration of evilginx2 into GoPhish
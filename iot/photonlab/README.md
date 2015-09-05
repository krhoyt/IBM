#Photon Hand-On Workshop

This workshop will introduce you to IoT using the Particle (formerly Spark) Photon. The Particle Photon offers a suite of hardware and software tools to help you prototype, scale, and manage your IoT products. Based on Broadcom’s WICED architecture (used in Nest, Amazon Dash), combined with a powerful ARM Cortex M3, the Photon offer wi-fi for everything. During this workshop you will pair the Photon with a wireless network, and then learn to control the digital and analog features, both in firmware, and from your own web application.

#Materials

- [Particle](http://particle.io) [Photon](https://store.particle.io/?product=particle-photon) ($19 USD)
- [Breadboard](https://www.sparkfun.com/products/9567) ($4.95 USD)
- [LED](https://www.sparkfun.com/products/11121) ($0.50 USD)
- [Photocell](https://www.sparkfun.com/products/9088) ($1.50 USD)
- 10k [resistor](https://www.sparkfun.com/products/11508) ($0.05 USD)
- [Jumper wires](https://www.sparkfun.com/products/8431) ($3.95 USD)
- [Micro USB cable](https://www.sparkfun.com/products/13244) ($1.95 USD)

*Approximate total cost per student: $32.00 USD*

#Setup

- create particle.io account
- particle login (login to account)
- listening mode (setup x3 seconds)
- particle setup (attach and wireless)
- particle setup wifi (may not be needed)
- reset button (connect to wireless)
- particle list (confirm cloud setup)
- particle serial list (confirm local acces)

#Outline

- photon/0-serial.ino (find your way around)
- photon/1-led.ino (digital pin control)
- photon/2-call.ino (expose cloud function)
- web/1-connect.html (connect to particle cloud)
- web/2-devices.html (list particle cloud devices)
- web/3-call.html (call cloud function)
- photon/3-photocell.ino (analog pin control)
- photon/4-variable.ino (expose cloud variable)
- photon/5-event.ino (publish cloud event)
- web/4-event.html (subscribe to cloud event)
- photon/6-remote.ino (device all in one)
- web/5-remote.html (client all in one)
- web/6-finish.html (polished client)
- photon/color.ino (time permitting, expose onboard RGB LED)
- photon/color.html (time permitting, control onboard RGB LED)

#Links

- [Connecting Over USB](https://docs.particle.io/guide/getting-started/connect/photon/)
- [Photon Reference](https://docs.particle.io/reference/firmware/photon/)
- [Device Modes](https://docs.particle.io/guide/getting-started/modes/photon/)
- [Command Line Reference](https://docs.particle.io/reference/cli/)
- [Hackathon Guide](https://docs.particle.io/guide/tools-and-features/hackathon/)

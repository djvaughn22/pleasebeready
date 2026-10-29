// Weather, outages, power, tools, water and safety.
// Format: see parse.ts.
export const weather = `
## water
Water bricks ; eme,hur,out ; g:2 ; brick ; x ; q=stackable water storage containers
Bathtub water storage bladder ; hur,eme,win ; g:1 ; bladder ; x ; q=bathtub water storage bladder | n=Fill before a storm if officials warn of water outages.
Water treatment drops ; eme,cmp,hik ; g:1 ; bottle ; x ; q=water treatment drops
Collapsible water containers ; eme,cmp,hur,out ; g:2 ; container ; u ; q=collapsible water container
Water bottle filter ; hik,vac,eme ; a:0.5 ; bottle ; x ; q=filter water bottle
Pitcher water filter ; hom,col ; g:1 ; pitcher ; x
Rain barrel ; hom ; g:1 ; barrel ; x ; s=seasonal
Water heater drain hose ; eme ; g:1 ; hose ; x ; q=garden hose short | n=Your water heater tank is a backup water source; read the maker's draining steps.
Hydration pack ; hik,spt,cmp ; p:0.5 ; pack ; x ; q=hydration backpack
Cooling water mister ; hea,bch,spt,tlg ; g:1 ; mister ; x ; s=seasonal ; q=handheld water mister fan

## power
Rechargeable AA batteries ; hom,out,eme ; g:8 ; battery/batteries ; u ; q=rechargeable aa batteries
AAA batteries ; hom,out,eme,sch ; g:8 ; battery/batteries ; u ; q=aaa batteries
D batteries ; out,eme,hur ; g:4 ; battery/batteries ; x ; q=d batteries
Coin cell batteries (CR2032) ; hom,veh ; g:1 ; pack ; x ; q=cr2032 battery | n=Car fobs, scales and trackers use them. Keep them away from children.
9-volt batteries ; hom ; g:2 ; battery/batteries ; x ; q=9v batteries | n=For smoke alarms that use them.
Battery charger ; hom,out ; g:1 ; charger ; x ; q=aa battery charger
Battery organizer and tester ; hom,eme ; g:1 ; organizer ; x ; q=battery organizer with tester
Hand-crank weather radio with charger ; out,eme,hur,win,wil,fld ; g:1 ; radio ; e ; q=hand crank weather radio power bank | n=Radios were among the biggest jumps in demand during the 2025 Iberian blackout.
Solar power bank ; out,cmp,hik,hur ; a:0.5 ; power bank ; x ; q=solar power bank
Large power bank (20,000 mAh) ; out,eme,vac,rdt,hur,win ; a:0.5 ; power bank ; u ; q=20000mah power bank
Portable solar panel ; out,eme,cmp ; g:1 ; panel ; x ; q=portable solar panel for power station
Wall charger with several ports ; vac,col,hst ; g:1 ; charger ; x ; q=usb c wall charger multiport
Inverter for the car ; out,veh,eme ; g:1 ; inverter ; x ; q=car power inverter | n=Run it only with the engine on and outdoors-ventilated.
Generator extension cord ; out,eme ; g:1 ; cord ; x ; q=generator extension cord | n=Use a cord rated for the load. Never plug a generator into a wall outlet.
Heavy-duty extension cord ; hom,tlg,pty ; g:1 ; cord ; x ; q=outdoor extension cord
Surge protector ; hom,col,wrk ; g:2 ; protector ; u
Uninterruptible power supply ; wrk,hom,out ; g:1 ; UPS ; x ; q=ups battery backup | n=Keeps a router or computer on for a short outage.
Battery-powered fan ; out,hea,cmp ; p:0.5 ; fan ; u ; s=seasonal ; q=battery operated fan
Clip-on fan ; col,hea ; g:1 ; fan ; x ; q=clip on fan
Rechargeable lantern ; out,eme,hur ; g:2 ; lantern ; u ; q=rechargeable lantern
Puck lights ; out,hom ; g:6 ; light ; x ; q=battery puck lights
Emergency light bulbs ; out ; g:4 ; bulb ; x ; q=rechargeable emergency light bulb
Solar garden lights ; out,hom ; g:6 ; light ; x ; q=solar pathway lights | n=Bring them inside at night as free light during an outage.
Candle alternatives ; out,eme ; g:6 ; candle ; x ; q=flameless led candles | n=Ready.gov advises flashlights over candles to avoid fires.
Work light ; out,fld,hur ; g:1 ; light ; x ; q=rechargeable work light
Power outage alert plug ; out,hom ; g:1 ; alert ; x ; q=power outage alarm

## weather
Winter hats ; win,eme ; p:1 ; hat ; u ; clim=cold ; s=seasonal ; q=winter beanie
Gloves or mittens ; win,eme,veh ; p:1 ; pair ; e ; clim=cold ; s=seasonal ; q=winter gloves
Kids' snow gear ; win ; k:1 ; set ; u ; need=kids ; clim=cold ; s=seasonal ; q=kids snow pants
Winter boots ; win ; p:1 ; pair ; u ; clim=cold ; s=seasonal
Thermal base layers ; win,cmp,out ; p:1 ; set ; u ; clim=cold ; s=seasonal ; q=thermal underwear set
Wool socks ; win,cmp,hik ; p:2 ; pair ; u ; clim=cold ; q=wool socks
Heated blanket ; win,crg ; g:1 ; blanket ; x ; clim=cold ; s=seasonal ; q=heated throw blanket
Indoor-safe space heater ; win,hom ; g:1 ; heater ; x ; clim=cold ; s=seasonal ; q=space heater with tip over shut off | n=Keep 3 feet clear and never run it on an extension cord.
Indoor-safe propane heater ; out,win,cmp ; g:1 ; heater ; x ; clim=cold ; q=indoor safe propane heater | n=Only models labeled indoor-safe, with a CO alarm and ventilation. Follow the label. | pro
Window insulation film ; win,hom ; g:1 ; kit ; x ; clim=cold ; s=seasonal ; q=window insulation kit
Door draft stopper ; win,hom ; g:2 ; stopper ; x ; clim=cold ; s=seasonal
Pipe insulation ; win,hom ; g:1 ; pack ; u ; clim=cold ; s=seasonal ; q=pipe insulation foam | n=Ready.gov says to insulate pipes before cold weather.
Faucet covers ; win,hom ; g:2 ; cover ; x ; clim=cold ; s=seasonal ; q=outdoor faucet cover
Ice melt ; win,hom ; g:2 ; bag ; u ; clim=cold ; s=seasonal ; q=pet safe ice melt
Snow shovel ; win,hom ; g:1 ; shovel ; u ; clim=cold ; s=seasonal
Roof rake ; win ; g:1 ; rake ; x ; clim=cold ; s=seasonal ; q=snow roof rake
Ice cleats ; win,crg ; a:1 ; pair ; x ; clim=cold ; s=seasonal ; q=ice cleats for shoes
Car snow brush and scraper ; win,veh ; g:1 ; brush/brushes ; e ; clim=cold ; s=seasonal ; q=snow brush ice scraper
Cooling towels ; hea,spt,hik,bch,tlg ; p:1 ; towel ; u ; clim=hot ; s=seasonal ; q=cooling towel
Neck fan ; hea,tlg,bch ; p:0.5 ; fan ; x ; clim=hot ; s=seasonal ; q=neck fan
Box fan ; hea,out,col ; g:1 ; fan ; x ; clim=hot ; s=seasonal
Window air conditioner ; hea,hom ; g:1 ; unit ; x ; clim=hot ; s=seasonal ; q=window air conditioner
Blackout curtains ; hea,hom,nbb ; g:2 ; panel ; x ; clim=hot ; q=thermal blackout curtains
Reflective window film ; hea ; g:1 ; roll ; x ; clim=hot ; s=seasonal ; q=heat blocking window film
Wide-brim sun hats ; hea,bch,hik,spt ; p:1 ; hat ; u ; clim=hot ; s=seasonal ; q=wide brim sun hat
Light, loose clothing ; hea,vac ; p:1 ; shirt ; x ; clim=hot ; s=seasonal ; q=upf sun shirt
Indoor thermometer and humidity monitor ; hea,win,crg,nbb ; g:1 ; monitor ; u ; q=indoor thermometer hygrometer | n=Helps you notice when a room is getting too hot or cold for babies and older adults.
Umbrellas ; hom,sch,wrk,vac ; p:0.5 ; umbrella ; u ; clim=wet ; q=compact umbrella
Rain jackets ; hik,cmp,vac,sch ; p:1 ; jacket ; u ; clim=wet ; q=rain jacket
Rain boots ; fld,sch,hom ; p:1 ; pair ; x ; clim=wet
Waterproof bin for documents ; fld,hur ; g:1 ; bin ; u ; q=waterproof storage box
Sandbags ; fld,hur ; g:20 ; bag ; x ; clim=wet ; s=seasonal ; q=sandbags | n=Follow local guidance on where and how to place them.
Water-activated flood barrier ; fld,hur ; g:2 ; barrier ; x ; clim=wet ; q=water activated flood barrier
Sump pump battery backup ; fld,hur ; g:1 ; backup ; x ; q=sump pump battery backup
Water leak alarms ; fld,hom ; g:3 ; alarm ; x ; q=water leak detector
Storm shutters or plywood fasteners ; hur ; g:1 ; set ; x ; s=seasonal ; q=plywood window clips hurricane
Window film for storms ; hur ; g:1 ; roll ; x ; s=seasonal ; q=window security film
Patio furniture tie-downs ; hur ; g:1 ; set ; x ; s=seasonal ; q=outdoor furniture straps
Air purifier ; wil,hom,sik ; g:1 ; purifier ; u ; q=hepa air purifier | n=EPA says a HEPA purifier sized for the room can lower indoor smoke.
Replacement HEPA filters ; wil,hom ; g:2 ; filter ; u ; q=hepa replacement filter
Furnace filters (MERV 13) ; wil,hom ; g:2 ; filter ; u ; q=merv 13 furnace filter
Box fan filter kit ; wil ; g:1 ; kit ; x ; q=box fan air filter | n=EPA describes do-it-yourself box-fan filters for smoke; never leave one running unattended.
Air quality monitor ; wil,hom ; g:1 ; monitor ; x ; q=air quality monitor pm2.5
Goggles for smoke and ash ; wil,fld ; a:1 ; pair ; x ; q=safety goggles
Fire-resistant document safe ; wil,hom ; g:1 ; safe ; x ; q=fire resistant document box
Garden hose and nozzle ; wil,hom ; g:1 ; set ; x ; q=garden hose nozzle
Ember-resistant vent covers ; wil ; g:1 ; set ; x ; q=ember resistant vent | n=Your local fire department can say what your home needs. | pro

## tools
Basic tool kit ; hom,col,mov ; g:1 ; kit ; u ; q=household tool kit
Cordless drill ; hom,mov ; g:1 ; drill ; x
Screwdriver set ; hom,col,mov ; g:1 ; set ; u
Adjustable wrench ; eme,hom ; g:1 ; wrench ; u ; n=Ready.gov lists a wrench or pliers to turn off utilities.
Gas shut-off wrench ; eme,hur ; g:1 ; wrench ; x ; q=gas shut off wrench | n=Only turn off gas if you smell it or officials say to; let the gas company turn it back on. | pro
Pliers ; hom,cmp,veh ; g:1 ; pair ; x
Hammer ; hom,mov,col ; g:1 ; hammer ; u
Tape measure ; hom,mov,col ; g:1 ; tape measure ; u
Utility knife ; mov,hom ; g:1 ; knife ; u ; q=box cutter
Stud finder ; hom,mov ; g:1 ; finder ; x
Level ; hom,mov ; g:1 ; level ; x
Picture hanging kit ; mov,col ; g:1 ; kit ; x
Command hooks and strips ; col,mov,hom ; g:1 ; pack ; u ; q=command strips
Zip ties ; hom,cmp,veh,tlg ; g:1 ; pack ; u
Bungee cords ; cmp,veh,mov,tlg ; g:1 ; set ; u
Ratchet straps ; mov,veh,hur ; g:4 ; strap ; x
Crowbar ; eme,hur ; g:1 ; crowbar ; x ; q=pry bar
Folding shovel ; eme,cmp,veh,win ; g:1 ; shovel ; u ; q=folding shovel
Chainsaw safety gear ; hur ; g:1 ; set ; x ; q=chainsaw chaps helmet | n=Only use a chainsaw if trained. | pro
Ladder ; hom,mov ; g:1 ; ladder ; x ; q=step ladder
Work flashlight with magnet ; hom,veh ; g:1 ; flashlight ; x ; q=magnetic flashlight
Caulk and sealant ; hom ; g:1 ; tube ; x
WD-40 or lubricant ; hom,veh ; g:1 ; can ; x ; q=multi use lubricant
Superglue ; hom,col ; g:1 ; pack ; x
Painter's tape ; mov,col ; g:2 ; roll ; x
Plunger ; hom,col,mov ; g:1 ; plunger ; u
Drain snake ; hom ; g:1 ; snake ; x ; q=drain snake
Light bulbs ; hom,mov ; g:6 ; bulb ; u ; pack=6 ; q=led light bulbs
Fuses or breakers labeled ; hom ; t ; task ; u ; id=label-breakers ; n=Label your breaker panel so anyone can find the right switch.
Smart plug ; hom,col ; g:2 ; plug ; x
Doorstops ; mov,hom ; g:2 ; doorstop ; x
Safety glasses ; hom,fld,hur ; a:1 ; pair ; x
Dust masks ; fld,hur,mov ; a:2 ; mask ; u ; q=dust masks
Ear protection ; hur,hom ; a:1 ; pair ; x ; q=ear muffs hearing protection
Tarp straps or bungee balls ; hur,cmp ; g:1 ; pack ; x ; q=bungee balls

## safety
Fire blanket ; hom,col,cmp ; g:1 ; blanket ; u ; q=fire blanket for kitchen | n=A top-converting item in Amazon's emergency preparedness searches.
Carbon monoxide alarm ; hom,out,win,col ; g:2 ; alarm ; e ; q=carbon monoxide detector | n=Put one on each floor and near sleeping areas. Ready.gov warns about CO from generators and heaters.
Escape ladder ; hom ; g:1 ; ladder ; x ; q=fire escape ladder 2 story
Reflective vests ; veh,hik ; g:2 ; vest ; x ; q=reflective safety vest
Personal safety alarm ; col,wrk,hik ; a:0.5 ; alarm ; x ; q=personal safety alarm
Door security bar ; vac,col ; g:1 ; bar ; x ; q=portable door lock travel
Window locks ; hom,nbb ; g:4 ; lock ; x
Cabinet locks ; nbb,hst ; g:1 ; pack ; u ; need=babies ; q=child safety cabinet locks
Baby gate ; nbb,hst ; g:1 ; gate ; u ; need=babies
Furniture anchors ; nbb,hom,mov ; g:1 ; kit ; u ; need=kids ; q=furniture anti tip kit | n=CPSC urges anchoring dressers and TVs.
Corner guards ; nbb ; g:1 ; pack ; x ; need=babies
Pool alarm or fence check ; bch,hom ; g:1 ; alarm ; x ; need=kids ; q=pool alarm
Waterproof phone case ; fld,hur,bch ; a:0.5 ; case ; x ; q=waterproof phone case
USB drive with document copies ; eme,hur,wil ; g:1 ; drive ; u ; q=encrypted usb drive | n=Store scans of IDs and insurance. Keep it locked or encrypted.
Laminated ID copies ; eme,vac ; p:1 ; card ; x ; q=laminating pouches
Pet first aid kit ; pet,cmp ; g:1 ; kit ; x ; need=pets ; q=pet first aid kit
Two-way radios ; cmp,eme,hik,tlg ; g:2 ; radio ; x ; q=two way radios | n=Handy where phones have no signal.
Satellite messenger ; hik,cmp ; g:1 ; device ; x ; q=satellite messenger | n=Check the subscription terms before relying on one.
Bike or scooter helmets ; sch,col ; k:1 ; helmet ; u ; need=kids ; q=kids bike helmet
Car seat check ; nbb,rdt,veh ; t ; task ; e ; need=babies ; id=car-seat-check ; n=Have a certified technician check the install. NHTSA lists free inspection stations. | pro
`;

// Car, travel, hiking, sports and outdoor days.
// Format: see parse.ts.
export const go = `
## car
Jumper cables ; veh,win,rdt ; g:1 ; set ; e ; q=jumper cables
Portable jump starter ; veh,win,rdt ; g:1 ; jump starter ; u ; q=portable jump starter
Tire pressure gauge ; veh,rdt ; g:1 ; gauge ; u
Tire repair kit ; veh,rdt ; g:1 ; kit ; x ; q=tire plug kit
Spare tire check ; veh,rdt ; t ; task ; u ; id=spare-tire-check ; n=Check the spare's pressure and that the jack and wrench are there.
Roadside warning triangles ; veh,rdt,win ; g:1 ; set ; u ; q=reflective warning triangle
Road flares (LED) ; veh,win ; g:1 ; set ; x ; q=led road flares
Tow strap ; veh,win ; g:1 ; strap ; x
Traction mats ; veh,win ; g:1 ; pair ; x ; clim=cold ; s=seasonal ; q=traction mats for snow
Kitty litter or sand for traction ; veh,win ; g:1 ; bag ; x ; clim=cold ; s=seasonal ; q=traction sand
Car blanket ; veh,win,rdt ; g:2 ; blanket ; u ; q=wool blanket
Windshield washer fluid ; veh,win,rdt ; g:1 ; jug ; u ; q=winter windshield washer fluid
Motor oil, one quart ; veh,rdt ; g:1 ; quart ; x ; q=motor oil
Coolant ; veh,hea ; g:1 ; jug ; x ; q=antifreeze coolant
Seatbelt cutter and window breaker ; veh,fld ; g:1 ; tool ; u ; q=seatbelt cutter window breaker
Car phone mount ; veh,rdt,wrk ; g:1 ; mount ; x
Car trunk organizer ; veh,rdt,spt ; g:1 ; organizer ; x ; q=trunk organizer
Emergency food bars for the car ; veh,win ; p:2 ; bar ; u ; q=emergency food bars 5 year
Water pouches for the car ; veh,hea,win ; p:3 ; pouch/pouches ; u ; q=emergency drinking water pouches
Car sun shades for windows ; veh,rdt,hea ; k:1 ; shade ; x ; need=kids ; q=car window sun shade baby
Car seat protector ; veh,nbb ; b:1 ; mat ; x ; need=babies ; q=car seat protector
Booster seat ; rdt,veh ; k:0.5 ; seat ; u ; need=kids ; n=Check your state's booster rules and the seat's height and weight limits. | pro
Infant car seat ; nbb ; b:1 ; seat ; e ; need=babies ; q=infant car seat | n=Never buy used without knowing the history. Check expiry and recalls.
Car garbage bags ; veh,rdt ; g:1 ; pack ; x ; q=car trash bags
Paper road map ; veh,rdt,eme,wil ; g:1 ; map ; x ; q=road atlas
Car charger for every row ; rdt ; g:1 ; charger ; x ; q=car charger multi port
Dash camera ; veh ; g:1 ; camera ; x ; q=dash cam
Car registration and insurance check ; veh,rdt ; t ; task ; u ; id=car-papers-check ; n=Make sure current copies are in the glove box.
Fill the gas tank ; hur,win,wil,rdt,eme ; t ; task ; e ; id=fill-gas ; n=Ready.gov suggests keeping the tank at least half full before storms.
Ice scraper for each car ; veh ; g:1 ; scraper ; x ; clim=cold ; q=ice scraper
Bike rack ; rdt,vac ; g:1 ; rack ; x ; q=hitch bike rack
Roof cargo bag ; rdt,cmp,mov ; g:1 ; bag ; x ; q=rooftop cargo bag
Cooler that plugs into the car ; rdt,cmp ; g:1 ; cooler ; x ; q=12v electric cooler
Car vacuum ; veh,rdt ; g:1 ; vacuum ; x ; q=handheld car vacuum
Pet seat cover ; rdt,pet ; g:1 ; cover ; x ; need=pets ; q=dog car seat cover
Pet car harness ; rdt,pet ; pet:1 ; harness ; u ; need=pets ; q=dog car harness

## travel
Passport and ID check ; vac ; t ; task ; e ; id=passport-check ; n=Check expiry dates; some countries require 6 months left. | pro
Passport holder ; vac ; p:0.5 ; holder ; x ; q=passport holder
Travel wallet ; vac ; a:0.5 ; wallet ; x ; q=rfid travel wallet
Luggage scale ; vac ; g:1 ; scale ; x
Luggage locks ; vac ; g:2 ; lock ; x ; q=tsa approved luggage locks
Luggage tracker ; vac ; g:2 ; tracker ; x ; q=luggage tracker
Kids' rolling suitcase ; vac ; k:1 ; suitcase ; x ; need=kids
Garment bag ; vac,wrk ; g:1 ; bag ; x
Compression packing cubes ; vac ; p:1 ; set ; x ; q=compression packing cubes | n=Packing cubes hit an all-time high in Google searches in 2025, Google reports.
Shoe bags ; vac ; p:1 ; bag ; x
Wet bag for swimsuits ; vac,bch ; g:2 ; bag ; x ; q=wet dry bag swimsuit
Travel bottles (TSA size) ; vac ; p:1 ; set ; u ; q=tsa approved travel bottles
Clear toiletry bag ; vac ; p:1 ; bag ; u ; q=clear toiletry bag tsa
Noise-canceling headphones ; vac,wrk,col ; a:0.5 ; pair ; x
Compression socks ; vac,crg ; a:1 ; pair ; x ; n=Ask a doctor if you have circulation problems. | pro
Portable door alarm ; vac ; g:1 ; alarm ; x ; id=travel-door-alarm ; q=travel door stop alarm
Universal sink stopper ; vac ; g:1 ; stopper ; x
Travel laundry detergent sheets ; vac,cmp ; g:1 ; pack ; x ; q=laundry detergent sheets
Kids' tablet case and headphones splitter ; rdt,vac ; k:0.5 ; set ; x ; need=kids ; q=headphone splitter
Car games and travel bingo ; rdt ; k:1 ; set ; x ; need=kids ; q=travel bingo cards
Snack containers for kids ; rdt,vac,spt ; k:1 ; container ; u ; need=kids ; q=spill proof snack container
Stroller for travel ; vac,nbb ; b:1 ; stroller ; x ; need=babies ; q=lightweight travel stroller
Car seat travel bag ; vac ; b:1 ; bag ; x ; need=babies ; q=car seat travel bag
Portable high chair ; vac,hst,pic ; b:1 ; chair ; x ; need=babies ; q=portable high chair
Baby white noise machine ; vac,nbb ; b:1 ; machine ; x ; need=babies ; q=portable white noise machine
Travel insurance check ; vac ; t ; task ; x ; id=travel-insurance ; n=Read what is and is not covered before you buy.
Hotel and car confirmations printed ; vac,rdt ; t ; task ; x ; id=print-confirmations ; n=A paper copy helps when phones die or there's no signal.
Tell your bank about travel ; vac ; t ; task ; x ; id=bank-travel ; n=Some banks no longer need this; check yours.
Offline maps downloaded ; rdt,vac,hik,cmp ; t ; task ; u ; id=offline-maps ; n=Download the area in your map app before you lose signal.

## outdoors
Hiking backpack ; hik,cmp ; a:1 ; pack ; u ; q=hiking daypack 20l
Trekking poles ; hik ; a:1 ; pair ; x ; q=trekking poles
Hiking boots ; hik,cmp ; p:1 ; pair ; u ; q=hiking boots
Trail snacks ; hik,cmp ; p:3 ; snack ; u ; q=trail snacks variety
Trail map or app download ; hik ; t ; task ; u ; id=trail-map ; n=Check the trail's park page for closures, weather and permits.
Tell someone your route ; hik,cmp ; t ; task ; e ; id=share-route ; n=Leave your route and expected return time with someone at home.
Emergency bivy ; hik,cmp ; p:1 ; bivy ; x ; q=emergency bivy sack
Bear spray ; hik,cmp ; g:1 ; can ; x ; n=Check park rules. Learn how to use it before you need it. | pro
Bear canister ; cmp,hik ; g:1 ; canister ; x ; q=bear canister | n=Some parks require one; check the rules.
Camping hammock ; cmp ; p:0.5 ; hammock ; x
Camp kitchen organizer ; cmp ; g:1 ; organizer ; x ; q=camp kitchen
Tent footprint ; cmp ; p:0.25 ; footprint ; x ; q=tent footprint
Tent stakes and mallet ; cmp ; g:1 ; set ; x ; q=tent stakes
Camp rug ; cmp ; g:1 ; rug ; x ; q=outdoor rug
Solar shower ; cmp ; g:1 ; shower ; x ; q=solar shower bag
Biodegradable soap ; cmp,hik ; g:1 ; bottle ; x
Trowel for waste ; cmp,hik ; g:1 ; trowel ; x ; q=backpacking trowel | n=Follow Leave No Trace and park rules.
Mosquito net ; cmp,hik ; p:1 ; net ; x ; q=mosquito head net
Citronella candles or repellent device ; cmp,pic,tlg ; g:2 ; device ; x ; q=mosquito repeller
Camp lantern hooks ; cmp ; g:1 ; set ; x ; q=lantern hanger
Sleeping bag liners ; cmp ; p:1 ; liner ; x
Kids' sleeping bags ; cmp,slp ; k:1 ; sleeping bag ; u ; need=kids ; q=kids sleeping bag
Campsite reservation and rules check ; cmp ; t ; task ; e ; id=campsite-rules ; n=Check fire bans, quiet hours and check-in times.
Fishing gear ; cmp,bch ; g:1 ; set ; x ; q=fishing rod combo | n=Most states need a license; check yours.
Kayak or paddle gear ; cmp,bch ; g:1 ; set ; x ; q=kayak paddle
Beach cart ; bch ; g:1 ; cart ; x ; q=beach cart
Beach tent ; bch ; p:0.25 ; tent ; x ; q=beach tent sun shelter
Sand-free beach blanket ; bch ; p:0.25 ; blanket ; x ; q=sand free beach blanket
Beach bag ; bch ; g:2 ; bag ; x ; q=large beach bag
Rash guards ; bch ; k:1 ; shirt ; x ; need=kids ; q=kids rash guard
Swim diapers ; bch,vac ; bd:3 ; diaper ; u ; need=babies ; pack=20 ; q=swim diapers
Puddle jumper or swim vest ; bch ; k:1 ; vest ; u ; need=kids ; q=coast guard approved puddle jumper | n=Not a substitute for watching swimmers.
Snorkel set ; bch,vac ; p:0.5 ; set ; x
Pool noodles ; bch ; k:1 ; noodle ; x ; need=kids
Sunscreen for kids ; bch,spt,pic ; k:0.25 ; bottle ; u ; need=kids ; q=kids mineral sunscreen
Picnic backpack ; pic ; g:1 ; backpack ; x ; q=picnic backpack
Picnic basket ; pic ; g:1 ; basket ; x
Insulated lunch bag ; pic,sch,wrk ; p:1 ; bag ; u ; q=insulated lunch bag
Portable hammock stand ; pic ; g:1 ; stand ; x
Bubbles and chalk ; pic,pty,slp ; k:1 ; set ; x ; need=kids ; q=sidewalk chalk bubbles
Kite ; pic,bch ; k:0.5 ; kite ; x ; need=kids

## fun
Stadium seat cushions ; spt,tlg ; p:1 ; cushion ; x ; q=stadium seat
Team snacks ; spt ; p:1 ; snack ; u ; q=individual snack packs
Orange slices and fruit cups for the team ; spt ; p:1 ; serving ; x ; q=fruit cups
Spare uniform pieces ; spt ; k:1 ; set ; x ; need=kids ; q=athletic socks
Shin guards and mouthguards ; spt ; k:1 ; set ; u ; need=kids ; q=youth shin guards
Sports bag ; spt ; k:1 ; bag ; u ; q=youth sports bag ; need=kids
Ball pump ; spt ; g:1 ; pump ; x
Tournament schedule and directions saved ; spt ; t ; task ; u ; id=tournament-schedule ; n=Save field addresses offline; parks often have weak signal.
Puzzle ; hom,out,win,crg ; g:2 ; puzzle ; x ; q=1000 piece puzzle
Books for kids ; out,win,eme,rdt ; k:2 ; book ; x ; need=kids ; q=kids chapter books
Craft supplies ; hom,out,win ; k:1 ; set ; x ; need=kids ; q=kids craft supplies
Movie night projector ; slp,hst,cmp ; g:1 ; projector ; x ; q=portable projector
Karaoke microphone ; slp,pty ; g:1 ; microphone ; x ; q=karaoke microphone
Scavenger hunt cards ; slp,pty,cmp ; g:1 ; set ; x ; need=kids ; q=scavenger hunt game kids
Sleepover tents for kids ; slp ; k:0.5 ; tent ; x ; need=kids ; q=kids play tent
Kids' sleeping masks and pajama favors ; slp ; k:1 ; set ; x ; need=kids ; q=kids sleep mask
Friendship bracelet kit ; slp ; k:0.5 ; kit ; x ; need=kids
Truth-or-dare or party game cards ; slp,pty ; g:1 ; deck ; x ; q=party game cards for teens
Video game controllers, extra ; slp,hst ; g:2 ; controller ; x ; q=game controller
Fidget toys ; sch,rdt,crg ; k:1 ; set ; x ; need=kids ; q=fidget toys
Busy book for toddlers ; rdt,vac,hst ; b:1 ; book ; x ; need=babies ; q=quiet book toddler
Sensory toys ; crg ; g:1 ; set ; x ; need=older ; q=sensory activity for seniors
`;

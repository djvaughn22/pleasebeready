// School, college, work, moving, babies, pets, parties, and things to do.
// Format: see parse.ts.
export const life = `
## school
Backpack ; sch ; k:1 ; backpack ; e ; need=kids ; s=seasonal ; q=kids backpack
Pencils ; sch ; k:12 ; pencil ; e ; need=kids ; s=seasonal ; pack=24 ; n=Check the school's own supply list first.
Pens ; sch,col,wrk ; p:3 ; pen ; u ; pack=12 ; q=ballpoint pens
Crayons or colored pencils ; sch ; k:1 ; box/boxes ; u ; need=kids ; s=seasonal ; q=crayons 24 count
Markers ; sch ; k:1 ; pack ; u ; need=kids ; s=seasonal ; q=washable markers
Glue sticks ; sch ; k:4 ; glue stick ; u ; need=kids ; s=seasonal ; pack=12
Kids' scissors ; sch ; k:1 ; pair ; u ; need=kids ; s=seasonal ; q=kids safety scissors
Notebooks ; sch,col ; p:4 ; notebook ; u ; s=seasonal ; q=spiral notebooks
Composition books ; sch ; k:2 ; book ; x ; need=kids ; s=seasonal
Folders ; sch,col,wrk ; p:4 ; folder ; u ; s=seasonal ; q=plastic folders with pockets
Binders ; sch,col ; p:1 ; binder ; x ; s=seasonal
Loose-leaf paper ; sch,col ; p:1 ; pack ; x ; s=seasonal
Erasers ; sch ; k:2 ; eraser ; x ; need=kids ; s=seasonal
Highlighters ; sch,col,wrk ; p:1 ; pack ; x
Pencil case ; sch ; k:1 ; case ; x ; need=kids
Rulers ; sch ; k:1 ; ruler ; x ; need=kids
Calculator ; sch,col ; p:0.5 ; calculator ; x ; q=scientific calculator | n=Check which model the class requires.
Lunchbox ; sch ; k:1 ; lunchbox/lunchboxes ; u ; need=kids ; q=kids lunch box
Reusable lunch containers ; sch,wrk ; p:1 ; set ; x ; q=bento lunch box
Kids' headphones for class ; sch ; k:1 ; pair ; x ; need=kids ; q=kids wired headphones
Name labels ; sch,cmp ; k:1 ; set ; u ; need=kids ; q=name labels for kids clothes
Change of clothes for school ; sch ; k:1 ; set ; x ; need=kids ; q=kids clothes set
Indoor shoes or gym shoes ; sch ; k:1 ; pair ; x ; need=kids ; q=kids sneakers
Classroom tissues and wipes donation ; sch ; k:1 ; set ; x ; need=kids ; q=classroom supplies tissues
School emergency contact form ; sch ; t ; task ; e ; need=kids ; id=school-contacts ; n=Update phone numbers and pickup names with the school office.
Homework station supplies ; sch ; g:1 ; set ; x ; need=kids ; q=desk organizer
Laptop ; col,wrk ; a:1 ; laptop ; x ; n=Check the school's or employer's requirements first.
Laptop sleeve ; col,wrk ; a:1 ; sleeve ; x ; q=laptop sleeve
Printer and ink ; col,hom ; g:1 ; set ; x ; q=wireless printer
Planner or calendar ; col,sch,wrk ; p:1 ; planner ; x ; q=academic planner
Desk lamp ; col,sch ; p:1 ; lamp ; u ; q=led desk lamp
Desk drawer snacks ; wrk ; a:5 ; snack ; x ; q=office snacks variety
Spare phone charger for work ; wrk ; a:1 ; charger ; u ; q=phone charger cable
Spare shirt or sweater at work ; wrk ; a:1 ; shirt ; x ; q=cardigan sweater
Comfortable walking shoes at work ; wrk,eme ; a:1 ; pair ; x ; q=walking shoes | n=Useful if you ever have to walk home.
Reusable coffee cup ; wrk,col ; a:1 ; cup ; x
Commute rain gear ; wrk ; a:1 ; set ; x ; clim=wet ; q=packable rain jacket
Bike lights ; wrk,col ; p:0.5 ; set ; x ; q=bike lights
Bike lock ; wrk,col ; p:0.5 ; lock ; x ; q=u lock bike
Transit card or backup fare ; wrk ; t ; task ; x ; id=transit-backup ; n=Keep a backup way to pay for the bus or train.
Work emergency plan ; wrk,eme ; t ; task ; u ; id=work-plan ; n=Know your workplace's exits, meeting point and how you'd get home. Ready.gov has a workplace plan guide.

## moving
Moving boxes ; mov,col ; v ; box/boxes ; e ; q=moving boxes | n=Roughly 10 boxes per room is a common starting count; heavy rooms like kitchens need more.
Packing tape ; mov ; g:4 ; roll ; e ; q=packing tape
Tape gun ; mov ; g:1 ; tape gun ; u ; q=packing tape dispenser
Bubble wrap ; mov ; g:1 ; roll ; u
Packing paper ; mov ; g:1 ; pack ; u
Moving blankets ; mov ; g:6 ; blanket ; u ; q=moving blankets
Furniture sliders ; mov ; g:1 ; set ; x
Hand truck or dolly ; mov ; g:1 ; dolly ; x ; q=hand truck dolly
Lifting straps ; mov ; g:1 ; set ; x ; q=moving straps
Mattress bags ; mov ; g:2 ; bag ; x ; q=mattress bag for moving
Wardrobe boxes ; mov ; g:2 ; box/boxes ; x
Stretch wrap ; mov ; g:1 ; roll ; x ; q=stretch wrap
Labels and markers ; mov ; g:1 ; set ; u ; q=moving labels color coded
Small parts bags ; mov ; g:1 ; pack ; x ; q=small ziplock bags
First-night box ; mov,col ; g:1 ; box/boxes ; e ; q=storage bin with lid | n=Sheets, toiletries, chargers, medicine, snacks and a change of clothes.
Storage bins ; mov,col,hom ; g:4 ; bin ; u ; q=plastic storage bins
Under-bed storage ; col,mov ; p:1 ; bin ; x ; q=under bed storage
Bed risers ; col ; p:1 ; set ; x
Twin XL sheets ; col ; p:2 ; set ; e ; s=seasonal ; q=twin xl sheets | n=Most dorm beds are twin XL; check with the school.
Mattress topper ; col ; p:1 ; topper ; u ; q=twin xl mattress topper
Comforter ; col,mov ; p:1 ; comforter ; u
Dorm fridge ; col ; p:0.5 ; fridge ; x ; q=mini fridge | n=Check the school's rules on appliances.
Microwave ; col,mov ; g:1 ; microwave ; x ; n=Check the dorm rules.
Electric kettle ; col ; g:1 ; kettle ; x ; n=Many dorms ban kettles; check first.
Dishes and cutlery for one ; col,mov ; p:1 ; set ; u ; q=dinnerware set for one
Pots and pans starter set ; mov,col ; g:1 ; set ; x ; q=pots and pans set
Over-the-door hooks ; col ; p:1 ; set ; x
Full-length mirror ; col,mov ; g:1 ; mirror ; x
Floor lamp ; col,mov ; g:1 ; lamp ; x
Area rug ; col,mov ; g:1 ; rug ; x
Doormat ; mov ; g:1 ; mat ; x
Shower curtain and rings ; mov ; g:1 ; set ; u
Curtains ; mov ; g:2 ; panel ; x
Hangers ; col,mov ; p:20 ; hanger ; u ; pack=50
Closet organizer ; col,mov ; g:1 ; organizer ; x ; q=hanging closet organizer
Change of address ; mov ; t ; task ; e ; id=change-address ; n=USPS, banks, employer, DMV and voter registration.
Transfer utilities and internet ; mov ; t ; task ; e ; id=transfer-utilities ; n=Book start dates before moving day.
Book the truck or movers ; mov ; t ; task ; e ; id=book-movers ; n=Check reviews and licensing for interstate movers (FMCSA).
Photograph the old place when empty ; mov ; t ; task ; u ; id=photo-old-place ; n=Helps with deposit disputes.
Find the new breaker panel and water shut-off ; mov ; t ; task ; u ; id=find-shutoffs

## baby
Diaper pail and refills ; nbb ; g:1 ; set ; u ; need=babies ; q=diaper pail
Changing pad ; nbb ; g:1 ; pad ; u ; need=babies
Changing pad covers ; nbb ; g:3 ; cover ; x ; need=babies
Portable changing mat ; nbb,rdt,vac ; g:1 ; mat ; u ; need=babies ; q=portable changing pad
Diaper bag ; nbb,rdt,vac ; g:1 ; bag ; u ; need=babies ; q=diaper bag backpack
Baby bodysuits ; nbb ; b:7 ; bodysuit ; e ; need=babies ; q=baby bodysuits
Sleepers ; nbb ; b:5 ; sleeper ; u ; need=babies ; q=baby sleepers zipper
Swaddles or sleep sacks ; nbb ; b:3 ; swaddle ; u ; need=babies ; q=sleep sack | n=Follow the AAP's safe sleep advice: back to sleep, nothing loose in the crib. | pro
Crib or bassinet ; nbb ; b:1 ; crib ; e ; need=babies ; q=bassinet | n=Use a firm, flat mattress that meets CPSC safety standards.
Crib sheets ; nbb ; b:3 ; sheet ; u ; need=babies ; q=fitted crib sheets
Waterproof mattress protector ; nbb,crg ; g:2 ; protector ; u ; q=waterproof mattress protector
Baby monitor ; nbb ; g:1 ; monitor ; x ; need=babies
Baby bathtub ; nbb ; b:1 ; tub ; u ; need=babies ; q=infant bath tub
Baby wash ; nbb ; g:1 ; bottle ; u ; need=babies ; q=baby wash
Hooded baby towels ; nbb ; b:3 ; towel ; x ; need=babies
Baby nail file ; nbb ; g:1 ; set ; x ; need=babies ; q=baby nail clippers
Bottle brush ; nbb ; g:1 ; brush/brushes ; u ; need=babies
Bottle drying rack ; nbb ; g:1 ; rack ; x ; need=babies
Bottle sterilizer ; nbb ; g:1 ; sterilizer ; x ; need=babies
Formula dispenser ; nbb,rdt ; g:1 ; dispenser ; x ; need=babies ; q=formula dispenser
Breast pump ; nbb ; g:1 ; pump ; x ; need=babies ; n=Many insurance plans cover one; check yours.
Breast milk storage bags ; nbb ; g:1 ; box/boxes ; x ; need=babies ; q=breastmilk storage bags
Nursing pads ; nbb ; g:1 ; pack ; x ; need=babies
Nursing pillow ; nbb ; g:1 ; pillow ; x ; need=babies
Postpartum recovery supplies ; nbb ; v ; kit ; u ; q=postpartum recovery kit | n=Ask your care team what you'll need. | pro
Baby carrier wrap ; nbb ; b:1 ; carrier ; x ; need=babies ; q=baby wrap carrier
Stroller ; nbb ; b:1 ; stroller ; u ; need=babies
Baby swing or bouncer ; nbb ; b:1 ; seat ; x ; need=babies ; q=baby bouncer | n=Not for sleep.
Play mat ; nbb ; b:1 ; mat ; x ; need=babies ; q=baby play mat
Teethers ; nbb ; b:2 ; teether ; x ; need=babies
Baby thermometer ; nbb ; g:1 ; thermometer ; e ; need=babies ; q=rectal thermometer baby | n=Ask your pediatrician which kind to use and when to call. | pro
Infant pain reliever ; nbb ; g:1 ; bottle ; u ; need=babies ; q=infant fever reducer | n=Ask a pediatrician before giving any medicine to a baby, especially under 3 months. | pro
Gas relief drops ; nbb ; g:1 ; bottle ; x ; need=babies ; q=infant gas drops | pro
Baby emergency kit ; eme,hur,out,win ; b:1 ; kit ; u ; need=babies ; q=diaper bag organizer | n=Diapers, formula, bottles, clothes and medicine for a few days.
Pediatrician picked ; nbb ; t ; task ; e ; need=babies ; id=pick-pediatrician ; n=Choose one before the birth so the hospital can share records.
Install the car seat early ; nbb ; t ; task ; e ; need=babies ; id=install-car-seat

## pets
Canned pet food ; pet,eme,hur ; petd:0.5 ; can ; u ; need=pets
Airtight food storage bin ; pet ; pet:1 ; bin ; x ; need=pets ; q=pet food storage container
Pet water dispenser ; pet,hea ; pet:0.5 ; dispenser ; x ; need=pets ; q=pet water fountain
Pet bed ; pet,rdt,vac ; pet:1 ; bed ; x ; need=pets
Pet crate for home ; pet ; pet:1 ; crate ; x ; need=pets ; q=dog crate
Collapsible pet crate ; eme,hur,wil ; pet:1 ; crate ; u ; need=pets ; q=collapsible dog crate | n=Ready.gov says many shelters require pets in carriers.
Cat litter box, disposable ; eme,rdt,vac ; pet:1 ; box/boxes ; x ; need=pets ; q=disposable litter box
Litter scoop and bags ; pet ; g:1 ; set ; x ; need=pets
Puppy pads ; pet,rdt,crg ; petd:1 ; pad ; x ; need=pets ; pack=100 ; q=puppy pads
Pet shampoo ; pet ; g:1 ; bottle ; x ; need=pets
Pet brush ; pet ; pet:1 ; brush/brushes ; x ; need=pets
Pet nail clippers ; pet ; g:1 ; clipper ; x ; need=pets
Flea and tick prevention ; pet,cmp,hik ; pet:1 ; supply/supplies ; u ; need=pets ; q=flea and tick prevention | n=Ask your vet which product suits your pet. | pro
Pet toys ; pet,rdt,vac,eme ; pet:2 ; toy ; x ; need=pets
Chew toys for stress ; eme,out ; pet:1 ; toy ; x ; need=pets ; q=durable dog chew toy
Calming aids for pets ; win,hur,eme ; pet:1 ; supply/supplies ; x ; need=pets ; q=dog anxiety vest | n=For storms and fireworks. Ask your vet about anything given by mouth. | pro
Long leash or tie-out ; cmp,pic ; pet:1 ; leash ; x ; need=pets ; q=long dog leash
Dog life jacket ; bch,cmp ; pet:1 ; jacket ; x ; need=pets ; q=dog life jacket
Dog booties ; win,hik ; pet:1 ; set ; x ; need=pets ; clim=cold ; q=dog boots
Pet cooling mat ; hea ; pet:1 ; mat ; x ; need=pets ; clim=hot ; s=seasonal ; q=pet cooling mat
Pet coat ; win ; pet:1 ; coat ; x ; need=pets ; clim=cold ; s=seasonal ; q=dog winter coat
GPS pet tracker ; pet,vac ; pet:1 ; tracker ; x ; need=pets ; q=gps dog tracker
Microchip registration check ; pet,eme ; t ; task ; e ; need=pets ; id=microchip-check ; n=Make sure the chip is registered with your current phone number.
Vaccination records copy ; pet,eme,vac ; t ; task ; u ; need=pets ; id=pet-vax-records ; n=Boarding and shelters may ask for proof.
Current pet photo ; pet,eme ; t ; task ; u ; need=pets ; id=pet-photo ; n=Ready.gov suggests a photo of you with your pet, to prove ownership.
Pet-friendly places to stay list ; eme,hur,wil,vac ; t ; task ; u ; need=pets ; id=pet-friendly-stays
Fish tank battery air pump ; out,pet ; g:1 ; pump ; x ; need=pets ; q=battery air pump aquarium
Bird or small pet carrier ; pet,eme ; pet:0.5 ; carrier ; x ; need=pets ; q=small animal carrier

## party
Party plates with a theme ; pty ; p:1.5 ; plate ; x ; s=event ; q=birthday party plates
Party cups with lids for kids ; pty ; k:2 ; cup ; x ; need=kids ; s=event ; q=kids party cups with lids
Pinata ; pty ; g:1 ; pinata ; x ; need=kids ; s=event
Pinata candy ; pty ; k:0.1 ; bag ; x ; need=kids ; s=event ; q=pinata candy
Party hats ; pty ; p:1 ; hat ; x ; s=event
Number candles ; pty ; g:1 ; set ; x ; s=event ; q=number candles
Cake stand ; pty,hst ; g:1 ; stand ; x
Cupcake liners and toppers ; pty ; g:1 ; set ; x ; s=event
Balloon pump ; pty ; g:1 ; pump ; x ; q=balloon pump
Balloon arch kit ; pty ; g:1 ; kit ; x ; s=event
Helium tank ; pty ; g:1 ; tank ; x ; s=event ; q=helium tank for balloons
Disposable chafing dishes ; pty,hst ; g:2 ; set ; x ; q=chafing dish set disposable
Sterno cans ; pty,hst ; g:4 ; can ; x ; q=chafing fuel cans
Drink labels or cup markers ; pty,hst ; g:1 ; set ; x ; q=cup markers
Ice bucket and scoop ; pty,hst ; g:1 ; set ; x
Toothpicks and party picks ; pty,hst ; g:1 ; pack ; x
Thank-you cards ; pty,hst ; g:1 ; pack ; x ; s=event
Invitations ; pty ; g:1 ; pack ; x ; s=event ; q=party invitations
Guest list and RSVPs ; pty,hst ; t ; task ; e ; id=rsvps ; n=Ask about food allergies when people reply.
Food allergy labels ; pty,hst ; g:1 ; set ; x ; q=food labels for party
Outdoor string lights ; pty,hst,tlg ; g:1 ; string ; x ; q=outdoor string lights
Folding chairs ; pty,hst ; p:0.5 ; chair ; x ; q=folding chairs
Guest bathroom basket ; hst ; g:1 ; basket ; x ; q=guest bathroom toiletries
Guest wifi card ; hst ; t ; task ; x ; id=guest-wifi
Gravy boat and serving dishes ; hst ; g:1 ; set ; x ; s=seasonal ; q=serving dish set
Extra trash and recycling run ; hst,pty ; t ; task ; x ; id=extra-trash-run ; n=Check trash pickup days around holidays.
Tailgate team flag ; tlg ; g:1 ; flag ; x ; s=event ; q=team flag
Parking pass and lot rules ; tlg ; t ; task ; u ; id=lot-rules ; n=Many stadiums limit grills, tents and glass.

## tasks
Make a family emergency plan ; eme,out,win,hur,wil,fld,hom ; t ; task ; e ; id=family-plan ; src=rg-plan ; n=Ready.gov: decide how you'll get alerts, where you'll meet and how you'll reach each other.
Pick two meeting places ; eme,wil,fld,hur ; t ; task ; e ; id=meeting-places ; n=One near home, one outside the neighborhood.
Choose an out-of-area contact ; eme,hur,wil ; t ; task ; u ; id=out-of-area-contact ; n=Texts often get through when calls do not.
Sign up for local alerts ; eme,out,win,hur,hea,wil,fld ; t ; task ; e ; id=local-alerts ; n=Search your county's name and "emergency alerts". Turn on wireless emergency alerts on phones.
Know your evacuation zone ; hur,fld,wil ; t ; task ; e ; id=evac-zone ; src=rg-evacuation ; n=Your county or state emergency site lists zones.
Plan routes out ; hur,wil,fld ; t ; task ; u ; id=evac-routes ; n=Have more than one route in case a road is closed.
Learn how to turn off utilities ; eme,hur,fld,hom,mov ; t ; task ; u ; id=learn-shutoffs ; n=Know where the water, gas and power shut-offs are. Leave gas to the utility to turn back on.
Test smoke and CO alarms ; hom,eme,win ; t ; task ; e ; id=test-alarms ; n=Test monthly; replace batteries as the maker says.
Practice a fire drill ; hom,sch ; t ; task ; u ; id=fire-drill ; n=Two ways out of each room if you can.
Photograph your belongings ; hom,hur,fld,wil,mov ; t ; task ; u ; id=home-inventory ; n=A quick video of each room helps with insurance claims.
Review insurance coverage ; hom,hur,fld,wil ; t ; task ; u ; id=review-insurance ; n=Most home policies do not cover flood; check with your agent. | pro
Store copies of key documents ; eme,hur,wil,fld ; t ; task ; e ; id=copy-documents ; src=rg-financial ; n=IDs, insurance, deeds, medical and pet records.
Keep some cash at home ; eme,out,hur,win ; t ; task ; u ; id=cash-at-home ; src=rg-financial ; n=Card readers and ATMs may not work in an outage.
Write down medicines and doses ; eme,crg,vac,sik ; t ; task ; e ; id=med-list ; n=Include allergies, doctors and pharmacy numbers.
Ask about early refills ; eme,hur,vac,crg ; t ; task ; u ; id=ask-refills ; n=Ask your pharmacist what your plan allows. | pro
Plan for power-dependent devices ; out,eme,crg,hur ; t ; task ; e ; need=medical ; id=power-device-plan ; src=rg-disability ; n=Tell your utility if someone relies on powered medical equipment; many have priority lists.
Register with a special needs registry ; eme,hur,wil ; t ; task ; u ; need=medical ; id=special-needs-registry ; n=Some counties keep a registry for help during evacuations.
Check in with older neighbors ; out,win,hea ; t ; task ; u ; id=check-neighbors ; src=rg-older
Charge everything before the storm ; out,win,hur ; t ; task ; e ; id=charge-everything
Freeze water bottles ; out,hur,hea ; t ; task ; x ; id=freeze-bottles ; n=They keep the freezer cold longer and become drinking water.
Turn the fridge to its coldest setting ; out,hur ; t ; task ; x ; id=fridge-coldest ; src=rg-power
Know when to throw food out ; out,hur ; t ; task ; u ; id=food-safety-outage ; src=rg-food ; n=Ready.gov: a full freezer holds about 48 hours if the door stays shut; throw out perishables above 40°F for 2 hours.
Bring in outdoor furniture ; hur,win ; t ; task ; u ; id=bring-in-furniture
Clear gutters and drains ; hur,fld,win ; t ; task ; x ; id=clear-gutters
Trim trees near the house ; hur,wil ; t ; task ; x ; id=trim-trees ; n=Hire a pro for large limbs or anything near power lines. | pro
Clear a defensible space ; wil ; t ; task ; u ; id=defensible-space ; n=Your state fire agency explains the zones around a home.
Find a cooling center ; hea ; t ; task ; u ; id=cooling-center ; n=Your city or county lists them during heat waves.
Know the signs of heat illness ; hea,spt,hik ; t ; task ; e ; id=heat-illness-signs ; n=CDC lists the signs of heat exhaustion and heat stroke; heat stroke is a 911 emergency.
Know the signs of hypothermia ; win,cmp,hik ; t ; task ; u ; id=hypothermia-signs ; src=rg-winter
Winterize the car ; win,veh ; t ; task ; u ; id=winterize-car ; n=Check battery, tires, wipers and antifreeze.
Service the furnace ; win,hom ; t ; task ; x ; id=service-furnace
Learn CPR and first aid ; eme,crg,nbb,hom ; t ; task ; u ; id=learn-cpr ; n=The Red Cross and AHA run classes.
Make a go-bag for each person ; eme,hur,wil,fld ; t ; task ; e ; id=pack-go-bags ; src=rc-kit
Make a list of what to grab ; eme,wil ; t ; task ; u ; id=grab-list ; n=Medicines, documents, chargers, glasses, pets.
Pack a kids' comfort item ; eme,hur,wil ; t ; task ; x ; need=kids ; id=comfort-item
Talk with kids about the plan ; eme,hur,wil,fld,out ; t ; task ; u ; need=kids ; id=talk-with-kids ; n=Ready.gov has kid-friendly activities.
Rotate stored food and water ; hom,eme ; t ; task ; u ; id=rotate-supplies ; n=Check dates every six months.
Set a reminder to check your kit ; eme,hom ; t ; task ; x ; id=kit-reminder ; n=Spring and fall time changes are an easy pair of dates.
Plan meals for the trip ; cmp,rdt,vac,hst ; t ; task ; u ; id=meal-plan ; n=Count meals before you shop; it keeps the list honest.
Check the weather forecast ; cmp,bch,pic,tlg,hik,spt ; t ; task ; u ; id=check-forecast
Confirm the headcount ; pty,slp,hst,tlg ; t ; task ; u ; id=confirm-headcount
Ask families about allergies ; slp,pty ; t ; task ; e ; need=kids ; id=ask-allergies
Share pickup time and address ; slp,pty ; t ; task ; u ; need=kids ; id=share-pickup
Plan a caregiver backup ; crg,nbb ; t ; task ; u ; id=caregiver-backup ; n=Who steps in if the main caregiver is sick?
Keep a care notebook ; crg ; t ; task ; u ; id=care-notebook ; n=Appointments, questions, medicines and changes in one place.
Ask about fall-proofing ; crg ; t ; task ; u ; need=older ; id=fall-proofing ; n=An occupational therapist can review the home. | pro
Schedule a vet check before travel ; pet,vac ; t ; task ; x ; need=pets ; id=vet-check-travel | pro
Arrange pet care while away ; vac,hst ; t ; task ; u ; need=pets ; id=arrange-pet-care
Hold the mail ; vac ; t ; task ; x ; id=hold-mail ; n=USPS has a free hold-mail service.
Back up your phone ; vac,eme,mov ; t ; task ; u ; id=backup-phone
Label the school supplies ; sch ; t ; task ; x ; need=kids ; id=label-supplies
`;

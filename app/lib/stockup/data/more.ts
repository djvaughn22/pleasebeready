// Kitchen, home stock-up, recovery and other gaps found in review.
// Format: see parse.ts.
export const more = `
## cooking
Slow cooker ; hst,hom,nbb ; g:1 ; slow cooker ; x ; n=Good for feeding a crowd or a tired household.
Electric griddle ; hst,slp ; g:1 ; griddle ; x
Waffle maker ; slp,hst ; g:1 ; waffle maker ; x
Air fryer ; col,hom ; g:1 ; air fryer ; x ; n=Check dorm rules first.
Rice cooker ; col,hom ; g:1 ; rice cooker ; x
Personal blender ; col,wrk ; g:1 ; blender ; x
Toaster ; mov,col ; g:1 ; toaster ; x
Coffee maker ; mov,col ; g:1 ; coffee maker ; x
Coffee pods ; hom,wrk ; pd:0.5 ; pod ; x ; pack=72 ; q=k cup coffee pods
Thermal carafe ; hst,pty ; g:1 ; carafe ; x ; q=thermal coffee carafe
Food thermos ; sch,wrk,win ; p:1 ; thermos ; u ; q=kids food thermos
Insulated bottle for hot drinks ; win,cmp,spt,hik ; p:0.5 ; bottle ; x ; q=vacuum insulated thermos
Measuring cups and spoons ; col,mov ; g:1 ; set ; x
Dish towels ; mov,col,hom ; g:4 ; towel ; u ; q=kitchen towels
Oven mitts ; mov,col,cmp ; g:2 ; mitt ; u ; q=oven mitts
Cooking spray ; hom,col,cmp ; g:1 ; can ; x
Spice starter set ; col,mov ; g:1 ; set ; x ; q=spice rack with spices
Cookie sheets ; hst,hom ; g:2 ; sheet ; x ; q=baking sheet pan
Aluminum pans with lids ; pty,hst,tlg ; g:4 ; pan ; u ; q=aluminum pans with lids
Cake carrier ; pty,hst ; g:1 ; carrier ; x
Ice cream scoop ; pty,slp ; g:1 ; scoop ; x
Pizza cutter ; pty,slp,col ; g:1 ; cutter ; x
Reusable straws ; pty,bch ; p:1 ; straw ; x ; pack=12
Sippy cups ; nbb,rdt ; b:2 ; cup ; u ; need=babies ; q=toddler sippy cup
Toddler plates and spoons ; nbb,hst ; b:1 ; set ; x ; need=babies ; q=toddler plates suction
Vacuum sealer ; hom ; g:1 ; sealer ; x
Mylar bags and oxygen absorbers ; eme ; g:1 ; kit ; x ; q=mylar bags oxygen absorbers | n=For long storage of dry foods. Follow the maker's steps; not for moist foods.
Food-grade buckets with lids ; eme,hom ; g:2 ; bucket ; x ; q=food grade bucket gamma lid
Date labels for food ; hom,eme,nbb ; g:1 ; roll ; x ; q=food date labels
Can rotation rack ; hom,eme ; g:1 ; rack ; x ; q=can organizer rack
Pantry bins ; hom,mov ; g:4 ; bin ; x ; q=pantry organizer bins
Powdered milk ; eme,hom ; pd:0.1 ; pouch/pouches ; x ; q=powdered milk
Water filter cartridges ; hom,col ; g:2 ; cartridge ; x ; q=water pitcher filter replacement

## weather
Foot warmers ; win,spt,tlg ; pd:1 ; pair ; x ; clim=cold ; s=seasonal ; q=foot warmers
Neck gaiter or balaclava ; win,hik ; p:1 ; gaiter ; x ; clim=cold ; s=seasonal ; q=balaclava
Hot water bottle ; win,sik ; g:1 ; bottle ; x ; clim=cold
Snow blower ; win ; g:1 ; snow blower ; x ; clim=cold ; s=seasonal
Cooling vest ; hea,wrk,spt ; a:0.5 ; vest ; x ; clim=hot ; s=seasonal ; q=cooling vest
Dehumidifier ; fld,hom ; g:1 ; dehumidifier ; x
Moisture meter ; fld ; g:1 ; meter ; x ; q=moisture meter
Utility water pump ; fld ; g:1 ; pump ; x ; q=utility pump | n=Only pump water once officials say it is safe to go back. | pro
Plywood panels for windows ; hur ; v ; panel ; x ; s=seasonal ; q=plywood window clips | n=Measure each window; cut panels before the season.
Fuel can ; out,hur,win ; g:1 ; can ; x ; q=gas can 5 gallon | n=Store fuel outside living areas and follow local rules. | pro
Fuel stabilizer ; out,hur ; g:1 ; bottle ; x
Clamp-on umbrella ; spt,bch ; g:2 ; umbrella ; x ; q=clamp on chair umbrella
Stroller fan and sun shade ; nbb,bch,hea ; b:1 ; set ; x ; need=babies ; clim=hot ; q=stroller sun shade

## outdoors
Camping cot ; cmp,hst,eme ; p:0.5 ; cot ; x
Shower privacy tent ; cmp ; g:1 ; tent ; x ; q=camping shower tent
Permethrin clothing spray ; cmp,hik ; g:1 ; bottle ; x ; q=permethrin spray for clothing | n=For clothes and gear only, never skin. Follow the label; toxic to cats when wet. | pro
Signal mirror ; hik ; g:1 ; mirror ; x
Gaiters ; hik ; p:1 ; pair ; x ; q=hiking gaiters
Bike repair kit ; col,hik,wrk ; g:1 ; kit ; x ; q=bike repair kit
Swimsuits ; bch,vac ; p:1 ; swimsuit ; u ; s=seasonal
Flip-flops ; bch,vac,cmp ; p:1 ; pair ; x ; s=seasonal
Kids' hearing protection ; tlg,spt,pty ; k:1 ; pair ; x ; need=kids ; q=kids noise canceling ear muffs

## safety
Water-resistant notebook and pencil ; eme,hik ; g:1 ; set ; x ; q=waterproof notebook
Permanent markers ; mov,eme,sch ; g:1 ; pack ; x ; q=sharpie markers
Spare keys made ; mov ; t ; task ; u ; id=spare-keys-made
Change the locks ; mov ; t ; task ; u ; id=change-locks ; n=Or rekey them; you don't know who has old copies.
Get renters or home insurance ; col,mov ; t ; task ; u ; id=renters-insurance ; n=Read what's covered for theft, fire and water.

## access
Overbed table ; crg ; g:1 ; table ; x ; need=mobility ; q=overbed table
Bedside urinal ; crg ; g:1 ; urinal ; x ; need=mobility ; q=bedside urinal
Wound care supplies ; crg ; v ; kit ; u ; n=Use what the nurse or doctor prescribes. | pro | q=non adherent wound dressing
Adult clothing protectors ; crg ; g:4 ; protector ; x ; need=older ; q=adult bibs
Talking clock ; crg ; g:1 ; clock ; x ; need=older ; q=talking clock for visually impaired
Tactile bump dots ; crg ; g:1 ; pack ; x ; need=older ; q=tactile bump dots | n=Mark appliance buttons for low vision.
Stair handrail check ; crg ; t ; task ; u ; need=older ; id=stair-rails ; n=Both sides if possible; have a pro install them. | pro
Ask for large-print medicine labels ; crg ; t ; task ; x ; need=older ; id=large-print-labels ; n=Many pharmacies print them on request.
Daily check-in plan ; crg,hea,win ; t ; task ; u ; need=older ; id=daily-check-in ; n=Agree who calls whom, and when.
Emesis bags ; sik,rdt,crg ; g:1 ; pack ; x ; q=emesis bags

## school
Index cards ; sch,col ; p:1 ; pack ; x
Sticky notes ; sch,wrk,col ; p:1 ; pack ; x
Stapler ; col,wrk ; g:1 ; stapler ; x
Binder clips ; wrk,col ; g:1 ; box/boxes ; x
Dry-erase board ; col,sch ; g:1 ; board ; x ; q=small dry erase board
Clear tape ; sch,hom ; g:2 ; roll ; x ; q=scotch tape
Webcam ; wrk ; g:1 ; webcam ; x
Headset with microphone ; wrk,col ; a:1 ; headset ; x
Ethernet cable ; col,wrk ; g:1 ; cable ; x
Lap desk ; col,crg ; p:0.5 ; desk ; x
Get a library card ; sch,col ; t ; task ; x ; id=library-card ; n=Free books, and often free museum passes.

## moving
Felt furniture pads ; mov ; g:1 ; pack ; x
Shelf liner ; mov ; g:1 ; roll ; x
Coat rack ; hst,pty,mov ; g:1 ; rack ; x
Shoe tray by the door ; hst,win,mov ; g:1 ; tray ; x ; q=boot tray

## baby
Potty training seat ; nbb ; b:1 ; seat ; x ; need=babies ; q=potty training seat
Travel potty ; rdt,vac,cmp ; b:1 ; potty/potties ; x ; need=babies ; q=portable travel potty
Overnight pull-ups ; slp,cmp,vac ; k:1 ; pack ; x ; need=kids ; q=overnight pull ups | n=Pack them quietly in the bag; some kids still need them.

## pets
Dog ramp or stairs ; pet,crg ; pet:0.5 ; ramp ; x ; need=pets ; q=dog ramp
Pet gate ; pet,hst ; g:1 ; gate ; x ; need=pets
Poop scooper ; pet ; g:1 ; scooper ; x ; need=pets

## travel
Carry medicines in labeled bottles ; vac ; t ; task ; u ; id=labeled-meds ; n=Some countries restrict certain medicines; check before you fly. | pro
`;

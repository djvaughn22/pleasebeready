// Household, pantry, cleaning, sick days, caregiving and accessibility.
// Format: see parse.ts. Amounts are our planning rules unless src= is set.
export const home = `
## food
Canned chili ; hom,eme,out,win,hur,cmp ; pd:0.2 ; can ; u
Canned pasta meals ; hom,eme,out,win,hur ; kd:0.3 ; can ; x ; need=kids
Canned salmon or sardines ; hom,eme,out ; pd:0.1 ; can ; x
Canned corned beef or ham ; eme,out,hur ; pd:0.1 ; can ; x
Shelf-stable meal kits ; eme,out,win,hur,wil ; pd:0.3 ; kit ; u ; q=shelf stable ready to eat meals
Freeze-dried meals ; eme,cmp,hik,hur ; pd:1 ; pouch/pouches ; u ; q=freeze dried meals | n=Our rule: one pouch per person per day as a backup meal.
Instant noodles ; hom,col,eme,out,win ; pd:0.3 ; pack ; x ; pack=24
Instant rice cups ; hom,col,eme,out ; pd:0.2 ; cup ; x ; pack=6
Instant mashed potatoes ; hom,eme,win ; pd:0.05 ; box/boxes ; x
Boxed macaroni and cheese ; hom,col,sch ; kd:0.2 ; box/boxes ; u ; need=kids
Dry beans and lentils ; hom,eme ; pd:0.05 ; pound ; x ; q=dry lentils
Flour ; hom,hst ; pd:0.02 ; bag ; u ; q=all purpose flour
Sugar ; hom,hst ; pd:0.01 ; bag ; x
Baking soda ; hom ; g:2 ; box/boxes ; x ; n=For baking, cleaning and smells.
Baking mixes ; hom,hst,pty ; g:2 ; box/boxes ; x ; q=brownie mix
Honey ; hom,eme,sik ; g:1 ; jar ; x ; n=Never give honey to babies under 1 year.
Jam or jelly ; hom,sch ; g:1 ; jar ; x
Hazelnut or seed butter ; hom,sch ; g:1 ; jar ; x ; n=Seed butter is handy where nut-free lunches are required. | q=sunflower seed butter
Nuts and seeds ; hom,hik,rdt,eme ; pd:0.05 ; bag ; x ; q=mixed nuts
Shelf-stable cheese crackers ; sch,rdt,spt,hik ; kd:1 ; pack ; u ; need=kids ; pack=20 ; q=cheese crackers snack packs
Applesauce pouches ; sch,rdt,spt,sik,nbb ; kd:1 ; pouch/pouches ; u ; need=kids ; pack=12
Pudding and fruit cups ; sch,rdt,spt ; kd:0.5 ; cup ; x ; need=kids ; pack=12 ; q=fruit cups
Rice cakes ; hom,sch ; g:2 ; pack ; x
Tortillas ; hom,cmp,pic ; pd:0.3 ; tortilla ; x ; pack=10
Frozen vegetables ; hom,sik,nbb ; pd:0.1 ; bag ; u ; n=Fill the freezer before a new baby or a busy stretch.
Frozen meals ; hom,nbb,crg,sik,col ; pd:0.3 ; meal ; u ; q=freezer meal containers | n=Our rule: one easy dinner in three from the freezer.
Freezer meal containers ; nbb,crg,hom ; g:10 ; container ; x ; q=freezer meal prep containers
Bouillon or broth ; hom,sik,win,eme ; pd:0.1 ; carton ; u ; q=chicken broth
Saltine crackers ; sik,hom,eme ; g:2 ; box/boxes ; u ; q=saltine crackers
Electrolyte drink mix ; sik,hea,spt,hik,cmp,eme ; pd:1 ; packet ; u ; pack=16 ; q=electrolyte powder packets | n=For heat and stomach bugs. Ask a doctor for babies and people on fluid limits. | pro
Herbal tea ; sik,hom,win ; g:1 ; box/boxes ; x
Ginger ale or ginger chews ; sik,rdt ; g:1 ; pack ; x ; q=ginger chews
Popsicles ; sik,hea,pty ; p:2 ; popsicle ; x ; pack=24 ; q=ice pop molds | n=Our rule: two each for a hot day or a sore throat.
Meal replacement shakes ; crg,sik,eme ; pd:1 ; bottle ; x ; q=nutrition shakes | n=Ask a doctor or dietitian if someone has diet limits. | pro
Thickened drinks ; crg ; v ; pack ; x ; need=medical ; n=Only if a speech therapist or doctor has said to. Follow their consistency. | pro | q=thickened water
Special diet foods ; hom,eme,crg,vac ; v ; supply/supplies ; u ; n=Gluten-free, allergy-safe or medical diets. Amount depends on the diet. | q=gluten free pantry
Baby food pouches ; nbb,rdt,vac ; bd:2 ; pouch/pouches ; u ; need=babies ; pack=12 ; n=Only for babies already eating solids.
Toddler snacks ; nbb,rdt,vac,spt ; bd:2 ; pack ; x ; need=babies ; q=toddler puffs snacks
Pet treats for training ; pet ; pet:1 ; bag ; x ; need=pets ; q=training treats
Coffee filters ; hom,cmp,hst ; g:1 ; pack ; x
Creamer ; hom,hst,wrk,cmp ; g:1 ; container ; x ; q=coffee creamer
Lunchbox snacks variety pack ; sch,wrk ; kd:5 ; snack ; u ; need=kids ; pack=40 ; q=snack variety pack

## drinks
5-gallon water jug ; hom,eme,out,hur ; g:2 ; jug ; u ; q=5 gallon water jug | n=Shows up often in Amazon searches next to emergency prep.
Water dispenser pump ; hom,eme,out ; g:1 ; pump ; x ; q=5 gallon water jug pump
Kids' water bottles ; sch,spt,hik,bch ; k:1 ; bottle ; u ; need=kids ; q=kids water bottle
Insulated tumbler ; wrk,col,rdt ; a:1 ; tumbler ; x
Decaf and tea for guests ; hst ; g:1 ; box/boxes ; x ; q=tea variety pack

## paper
Kitchen trash bags (13 gallon) ; hom,col,mov ; pd:0.3 ; bag ; e ; pack=80 ; q=13 gallon trash bags | n=One of the most searched household items on Amazon.
Large trash bags (30 gallon or more) ; hom,mov,fld,hur,tlg ; g:20 ; bag ; u ; q=30 gallon trash bags
Contractor bags ; fld,hur,mov ; g:20 ; bag ; u ; q=contractor trash bags | n=For heavy, wet or sharp debris.
Small trash bags (4 gallon) ; hom,col,wrk ; g:50 ; bag ; x ; q=4 gallon trash bags
Paper lunch bags ; sch,wrk ; kd:1 ; bag ; x ; pack=100 ; need=kids
Sandwich bags ; sch,wrk,hom,pic ; pd:1 ; bag ; u ; pack=100
Freezer bags ; hom,out,nbb ; g:1 ; box/boxes ; x ; q=gallon freezer bags
Plastic wrap ; hom,hst,pty ; g:1 ; roll ; x
Parchment paper ; hom,hst ; g:1 ; roll ; x
Toilet seat covers ; vac,rdt,crg ; g:1 ; pack ; x
Portable toilet bags ; eme,out,fld,hur,cmp,rdt ; pd:1 ; bag ; u ; q=portable toilet waste bags | n=For when toilets cannot flush. Ready.gov lists garbage bags and ties for sanitation.
Portable toilet bucket ; eme,hur,fld,cmp ; g:1 ; toilet ; x ; q=portable toilet bucket

## cleaning
Laundry pods ; hom,col,vac ; pd:0.15 ; pod ; u ; pack=80 ; n=Keep pods up high and away from kids.
Dryer sheets ; hom,col ; pd:0.1 ; sheet ; x ; pack=200
Fabric softener ; hom ; g:1 ; bottle ; x
Bleach-free disinfectant spray ; hom,sik,crg ; g:1 ; can ; u ; q=disinfectant spray
Glass cleaner ; hom,mov ; g:1 ; bottle ; x
Bathroom cleaner ; hom,mov,hst ; g:1 ; bottle ; u
Toilet bowl cleaner ; hom,mov ; g:1 ; bottle ; u
Floor cleaner ; hom,mov ; g:1 ; bottle ; x
Mop and bucket ; hom,mov,fld ; g:1 ; set ; u ; q=mop and bucket set
Broom and dustpan ; hom,mov,col ; g:1 ; set ; u
Cordless stick vacuum ; hom,col ; g:1 ; vacuum ; x ; q=cordless stick vacuum
Microfiber cloths ; hom,mov,veh ; g:1 ; pack ; u ; pack=24
Scrub brushes ; hom,mov,fld ; g:2 ; brush/brushes ; x
Magic erasers ; hom,mov ; g:1 ; pack ; x ; q=melamine sponge
Dish rack ; col,mov ; g:1 ; rack ; x
Heavy-duty work gloves ; fld,hur,wil,mov,win ; a:1 ; pair ; u ; q=work gloves | n=For cleanup after storms and floods.
Mold and mildew cleaner ; fld,hur ; g:2 ; bottle ; u ; n=Follow the label and the CDC's mold cleanup advice. | pro
Wet/dry shop vacuum ; fld,hur,hom ; g:1 ; vacuum ; x ; q=wet dry shop vac
Odor absorber ; hom,fld,pet,veh ; g:2 ; pack ; x ; q=odor absorber
Air freshener ; hom,hst ; g:1 ; can ; x
Laundry hamper ; col,mov ; p:0.5 ; hamper ; x ; q=collapsible laundry hamper
Drying rack ; col,out,hom ; g:1 ; rack ; x ; q=clothes drying rack
Stain remover spray ; hom,nbb,sch ; g:1 ; bottle ; x ; q=laundry stain remover spray
Enzyme cleaner for pet accidents ; pet,hom ; g:1 ; bottle ; u ; need=pets ; q=enzyme pet stain cleaner
Lint brush for pet hair ; pet ; g:1 ; brush/brushes ; x ; need=pets ; q=pet hair remover
Handheld steamer ; vac,wrk,col ; g:1 ; steamer ; x ; q=handheld clothes steamer
Sewing kit ; vac,col,hom ; g:1 ; kit ; x ; q=travel sewing kit
Shoe cleaner ; spt,sch ; g:1 ; kit ; x ; q=shoe cleaner kit

## toiletries
Bar soap ; hom,eme,cmp ; pd:0.05 ; bar ; u ; pack=8
Conditioner ; hom,vac,col ; pd:0.02 ; bottle ; x
Razors ; hom,vac,col ; a:1 ; pack ; x
Shaving cream ; hom,vac ; a:0.5 ; can ; x
Dental floss ; hom,vac,eme ; p:0.5 ; pack ; x
Mouthwash ; hom,vac ; g:1 ; bottle ; x
Cotton swabs ; hom,nbb ; g:1 ; pack ; x
Cotton rounds ; hom ; g:1 ; pack ; x
Nail clippers ; hom,vac,nbb ; g:1 ; clipper ; x
Hair ties and brush ; slp,vac,sch ; k:1 ; set ; x ; need=kids ; q=hair ties
Lotion ; hom,win,vac ; g:1 ; bottle ; x
Hand cream ; win,wrk ; a:0.5 ; tube ; x
Dry shampoo ; cmp,eme,out,vac,col ; a:0.5 ; can ; x
No-rinse bathing wipes ; eme,out,cmp,crg,hur ; pd:2 ; wipe ; u ; pack=30 ; q=no rinse bathing wipes | n=Useful when water is short or someone cannot shower.
No-rinse shampoo cap ; crg,eme ; g:4 ; cap ; x ; q=no rinse shampoo cap
Shower caddy ; col,cmp ; p:1 ; caddy ; u ; q=shower caddy portable
Shower shoes ; col,cmp,vac ; p:1 ; pair ; u ; q=shower sandals
Bath towels ; col,mov,hom ; p:2 ; towel ; u
Washcloths ; col,crg,nbb ; p:3 ; washcloth ; x ; pack=12
Robe ; col ; p:1 ; robe ; x
Menstrual underwear or cups ; hom,vac,col,eme ; a:0.5 ; set ; x ; q=period underwear
Incontinence underwear ; crg,eme ; v ; pack ; u ; need=older ; q=adult incontinence underwear | n=Size and absorbency vary. Keep a week's supply.
Bed pads ; crg,nbb ; v ; pack ; u ; q=disposable underpads | n=For beds and chairs during illness or recovery.
Denture care supplies ; crg,eme,vac ; v ; kit ; u ; need=older ; q=denture cleaning kit ; n=One kit per person who wears dentures, plus a spare case for trips.
Hearing aid batteries ; crg,eme,vac,out ; v ; pack ; u ; need=older ; q=hearing aid batteries | n=Check the size with the audiologist.
Glasses repair kit ; vac,crg ; g:1 ; kit ; x
Travel-size toiletries ; vac,slp,rdt,hst ; p:1 ; set ; u ; q=travel size toiletries
Toiletry bag ; vac,col,cmp ; p:1 ; bag ; x ; q=hanging toiletry bag
Makeup remover wipes ; vac,slp ; g:1 ; pack ; x
Deodorant wipes ; spt,cmp,hik ; g:1 ; pack ; x ; q=body wipes for adults

## health
Cold and flu medicine ; sik,hom,eme ; g:1 ; box/boxes ; u ; n=Check with a pharmacist if someone takes other medicines. | pro | q=cold and flu medicine
Children's cold medicine ; sik ; g:1 ; bottle ; u ; need=kids ; n=Follow the age and weight chart; ask a pediatrician for young children. | pro | q=children's cold medicine
Cough drops ; sik,win,wrk ; g:1 ; bag ; u
Throat spray ; sik ; g:1 ; bottle ; x
Saline nasal spray ; sik,wil,hom ; g:1 ; bottle ; x
Nasal aspirator ; nbb,sik ; b:1 ; aspirator ; u ; need=babies ; q=baby nasal aspirator
Humidifier ; sik,win,nbb ; g:1 ; humidifier ; x ; q=cool mist humidifier | n=Clean it as the maker says.
Vapor rub ; sik ; g:1 ; jar ; x
Heating pad ; sik,crg,hom ; g:1 ; pad ; x
Ice packs for injuries ; spt,hom,crg ; g:2 ; pack ; u ; q=reusable ice packs for injuries
Elastic bandage wraps ; spt,hik,cmp,eme ; g:2 ; wrap ; u ; q=elastic bandage wrap
Athletic tape ; spt ; g:2 ; roll ; x
Blister care ; hik,spt,vac,cmp ; g:1 ; pack ; u ; q=blister bandages
Moleskin ; hik ; g:1 ; pack ; x
Burn gel ; cmp,eme,hom ; g:1 ; tube ; x ; q=burn gel
Antibiotic ointment ; hom,cmp,spt,eme,sch ; g:1 ; tube ; u
Hydrocortisone cream ; hom,cmp,pic ; g:1 ; tube ; x
Gauze and medical tape ; eme,cmp,crg,hik ; g:1 ; set ; u ; q=gauze pads and medical tape
Medical scissors ; eme,crg ; g:1 ; pair ; x ; q=trauma shears
Disposable gloves for first aid ; eme,crg,sik ; g:1 ; box/boxes ; u ; q=nitrile gloves
Pulse oximeter ; crg,sik ; g:1 ; oximeter ; x ; n=A home reading is not a diagnosis. Call a doctor about worrying numbers. | pro
Blood pressure monitor ; crg ; g:1 ; monitor ; x ; need=older ; n=Use it the way a doctor or nurse shows you. | pro
Pill crusher or splitter ; crg ; g:1 ; tool ; x ; need=older ; n=Ask a pharmacist first; some pills must not be split or crushed. | pro
Medicine dosing syringes ; nbb,sik ; g:2 ; syringe ; u ; need=babies ; q=oral medicine syringe
Medicine lockbox ; hom,crg ; g:1 ; lockbox/lockboxes ; x ; q=medication lock box
Medical device backup batteries ; out,eme,crg,hur,win ; v ; set ; e ; need=medical ; n=Ask the device maker or supplier how long a backup lasts. Ready.gov says to plan for power-dependent devices. | pro | q=medical device backup battery
Cooler for insulin or medicines ; out,hea,vac,rdt,eme ; g:1 ; case ; u ; need=medical ; q=insulin cooling case | n=Follow the medicine's storage instructions. | pro
Diabetes supplies ; eme,vac,crg ; v ; kit ; e ; need=medical ; n=Test strips, lancets and glucose tabs. Ask the care team how much to keep. | pro | q=glucose tablets
Allergy action kit ; sch,spt,vac,slp ; v ; kit ; e ; need=medical ; n=Carry prescribed epinephrine as the doctor says; check expiry dates. | pro | q=epipen carrying case
Inhaler spacer ; sch,eme,vac ; v ; spacer ; u ; need=medical ; n=Use the spacer your doctor or pharmacist recommends. | pro | q=inhaler spacer
Lice comb ; sch,slp ; g:1 ; comb ; x ; need=kids
Sunburn spray ; bch,vac ; g:1 ; can ; x ; q=sunburn relief spray
Bite and sting relief ; cmp,hik,pic,bch ; g:1 ; pack ; x ; q=sting relief wipes
Eye drops ; wil,hom,vac ; g:1 ; bottle ; x ; q=lubricating eye drops
Kids' masks ; wil,sik ; k:5 ; mask ; u ; need=kids ; q=kids kn95 masks
Covid and flu home tests ; sik,hom ; g:2 ; test ; x ; q=covid flu home test
First aid kit for the car ; veh,rdt ; g:1 ; kit ; u ; q=car first aid kit
Lip balm ; win,hik,wrk ; p:1 ; tube ; x
Motion sickness medicine for kids ; rdt,vac ; g:1 ; box/boxes ; x ; need=kids ; q=kids motion sickness | n=Follow the age chart. | pro
Medical alert ID ; crg,eme ; v ; bracelet ; u ; need=medical ; q=medical alert bracelet ; n=One for each person with a condition responders should know about.

## access
Grab bars ; crg,hom ; g:2 ; bar ; u ; need=older ; n=Install into studs or use the maker's anchors. | q=grab bars for bathroom
Shower chair ; crg ; g:1 ; chair ; u ; need=mobility ; q=shower chair
Handheld shower head ; crg ; g:1 ; shower head ; x ; need=mobility
Raised toilet seat ; crg ; g:1 ; seat ; u ; need=mobility ; q=raised toilet seat
Bedside commode ; crg,out ; g:1 ; commode ; x ; need=mobility ; q=bedside commode
Bed rail ; crg ; g:1 ; rail ; x ; need=older ; n=Ask a health professional which kind is safe for the bed and person. | pro
Reacher grabber ; crg ; p:0.25 ; reacher ; u ; need=mobility ; q=reacher grabber tool
Long-handled shoe horn ; crg ; g:1 ; shoe horn ; x ; need=mobility
Sock aid ; crg ; g:1 ; aid ; x ; need=mobility
Walker accessories ; crg ; g:1 ; set ; x ; need=mobility ; q=walker basket tray
Cane with spare tips ; crg,eme ; g:1 ; set ; x ; need=mobility ; q=cane tips
Wheelchair cushion ; crg ; g:1 ; cushion ; x ; need=mobility
Portable ramp ; crg,hst ; g:1 ; ramp ; x ; need=mobility ; n=Check the rise and weight limit before buying. | q=portable wheelchair ramp
Transfer belt ; crg ; g:1 ; belt ; x ; need=mobility ; n=Learn safe transfers from a nurse or therapist. | pro | q=gait belt
Non-slip bath mat ; crg,hom,nbb ; g:1 ; mat ; u
Motion-sensor night lights ; crg,hom ; g:4 ; light ; u ; need=older ; q=motion sensor night light
Large-button phone ; crg ; g:1 ; phone ; x ; need=older ; q=big button phone
Medical alert system ; crg ; g:1 ; system ; x ; need=older ; n=Compare monitoring terms carefully before signing up. | q=medical alert device
Pill organizer with alarms ; crg ; g:1 ; organizer ; u ; need=older ; q=automatic pill dispenser
Large-print calendar ; crg ; g:1 ; calendar ; x ; need=older
Magnifier ; crg ; g:1 ; magnifier ; x ; need=older ; q=lighted magnifier
Amplified headphones or TV speaker ; crg ; g:1 ; device ; x ; need=older ; q=tv speaker for hearing
Visual or vibrating smoke alarm ; crg,hom ; g:1 ; alarm ; u ; need=medical ; q=smoke alarm for deaf strobe | n=For people who are deaf or hard of hearing.
Communication board ; crg,eme ; g:1 ; board ; x ; need=medical ; q=communication board | n=Ready.gov suggests ways to communicate if speech or hearing is affected.
Weighted utensils ; crg ; p:0.25 ; set ; x ; need=mobility ; q=adaptive utensils
Non-spill cups ; crg ; p:0.25 ; cup ; x ; need=older ; q=adult sippy cup
Lift chair or bed wedge ; crg ; g:1 ; wedge ; x ; need=mobility ; q=bed wedge pillow
Door alarm ; crg ; g:2 ; alarm ; x ; need=older ; q=door alarm chime | n=For someone who may wander.
Key safe ; crg ; g:1 ; key safe ; x ; q=key lock box | n=So a carer or responder can get in.
Spare mobility device batteries ; out,eme,crg ; v ; battery/batteries ; u ; need=mobility ; q=power wheelchair battery charger | n=Ask the supplier which spare fits.
Accessible go-bag labels ; eme ; g:1 ; set ; x ; need=medical ; q=waterproof labels
`;

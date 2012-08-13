 db.places.insert( {name:'test', loc : [ 50 , 30 ] });
 db.places.ensureIndex( { loc : "2d" } );
 db.places.find();

 db.places.find( { loc : [50,50] } );
 db.places.find( { loc : { $near : [50,50] } } )

 
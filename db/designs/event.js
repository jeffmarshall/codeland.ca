var toJSON = JSON.stringify;


module.exports = {
  _id: '_design/event',
  language: 'javascript',
  validate_doc_update: function(new_doc, old_doc, user_context){

    function required(be_true, message){
      if (!be_true) throw { forbidden: message };
    }

    function user_is(role){
      return user_context.roles.indexOf(role) >= 0;
    }

    function isValidDate(d) {
      var d = new Date(d);
      if ( Object.prototype.toString.call(d) !== "[object Date]" )
        return false;
      return !isNaN(d.getTime());
    }

    if (old_doc && old_doc.type == 'event'){
      required(
        old_doc.creator_name == user_context.name || user_is('_admin'),
        "Only the creator of this post can change it."
      )
    }

    if (new_doc._deleted){
      return
    }

    if (new_doc.type == 'event'){
      required(
        new_doc.hasOwnProperty('creator_name'),
        "'creator_name' is required."
      )

      required(
        typeof new_doc.creator_name == 'string',
        "'creator_name' must be a string."
      )

      required(
        new_doc.hasOwnProperty('name'),
        "'name' is required."
      )

      required(
        typeof new_doc.name == 'string',
        "'name' must be a string"
      )

      required(
        new_doc.name.length <= 75,
        "An event's name cannot exceed 75 characters."
      )

      required(
        new_doc.hasOwnProperty('start'),
        "'start' is required."
      )

      required(
        isValidDate(new_doc.start),
        "A valid start date is required."
      )

      required(
        new_doc.hasOwnProperty('city'),
        "'city' is required."
      )

      required(
        typeof new_doc.city == 'string',
        "'city' must be a string."
      )

      required(
        new_doc.city.length <= 75,
        "An event's city name must not exceed 75 characters."
      )

      required(
        new_doc.hasOwnProperty('venue'),
        "'venue' is required."
      )

      required(
        typeof new_doc.venue == 'string',
        "'venue' must be a string."
      )

      required(
        new_doc.venue.length <= 75,
        "An event's venue name must not exceed 75 characters."
      )

      if (new_doc.description){
        required(
          typeof new_doc.description == 'string',
          "'description' must be a string."
        )

        required(
          new_doc.description.length <= 5000,
          "The description is too long."
        )
      }

      if (new_doc.homepage){
        required(
          typeof new_doc.homepage == 'string',
          "'homepage' must be a string."
        )

        required(
          new_doc.homepage.length <= 1000,
          "The homepage url is too long."
        )

        required(
          new_doc.homepage.indexOf('javascript:') == -1,
          "No javascript in the homepage URL!"
        )
      }

      if (new_doc.seeking_sponsors){
        required(
          typeof new_doc.seeking_sponsors == 'boolean',
          "'seeking_sponsors' must be a boolean value."
        )
      }

      if (!user_is('_admin')){
        var fields = [
          'name',
          'venue',
          'city',
          'start',
          'description',
          'homepage',
          'seeking_sponsors',
          'type',
          'creation_date',
          'creator_name',
          '_id',
          '_rev',
          '_revisions'
        ].sort();

        var new_doc_keys = Object.keys(new_doc);

        for (i in new_doc_keys){
          if (fields.indexOf(new_doc_keys[i]) == -1){
            throw({ forbidden: '"'+ new_doc_keys[i] +'" is not allowed.' })
          }
        }
      }
    }
  },

  views: {
    "list": {
      "map": function(doc) {
        if(doc.type === 'event'){
          emit([doc.city, doc.start], {
            name: doc.name,
            venue: doc.venue,
            start: doc.start,
            homepage: doc.homepage,
            has_description: !!doc.description,
            creation_date: doc.creation_date
          })
        }
      }
    }
  }
}



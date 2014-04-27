var toJSON = JSON.stringify;


module.exports = {
  _id: '_design/job',
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

    if (old_doc && old_doc.type == 'job'){
      required(
        old_doc.creator_name == user_context.name || user_is('_admin'),
        "Only the creator of this post can change it."
      )
    }

    if (new_doc._deleted){
      return
    }

    if (new_doc.type == 'job'){
      required(
        new_doc.hasOwnProperty('creator_name'),
        "'creator_name' is required."
      )

      required(
        typeof new_doc.creator_name == 'string',
        "'creator_name' must be a string."
      )

      required(
        new_doc.hasOwnProperty('position'),
        "'position' is required."
      )

      required(
        typeof new_doc.position == 'string',
        "'position' must be a string"
      )

      required(
        new_doc.position.length <= 75,
        "A job's position cannot exceed 75 characters."
      )

      required(
        new_doc.hasOwnProperty('employer'),
        "'employer' is required."
      )

      required(
        typeof new_doc.employer == 'string',
        "'employer' must be a string"
      )

      required(
        new_doc.employer.length <= 75,
        "An job's employer cannot exceed 75 characters."
      )

      required(
        new_doc.hasOwnProperty('city'),
        "'city' is required."
      )

      required(
        typeof new_doc.city == 'string',
        "'city' must be a string"
      )

      required(
        new_doc.city.length <= 20,
        "An job's city cannot exceed 20 characters."
      )

      if (new_doc.stripe_payment_id){
        required(
          typeof new_doc.stripe_payment_id == 'string',
          "'stripe_payment_id' must be a string"
        )
      }

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

      if (new_doc.instructions){
        required(
          typeof new_doc.instructions == 'string',
          "'instructions' must be a string."
        )

        required(
          new_doc.instructions.length <= 5000,
          "The instructions are too long."
        )
      }

      if (new_doc.neighborhood){
        required(
          typeof new_doc.neighborhood == 'string',
          "'neighborhood' must be a string."
        )

        required(
          new_doc.neighborhood.length <= 75,
          "The neighborhood is too long."
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

      if (!user_is('_admin')){
        var fields = [
          'name',
          'employer',
          'city',
          'instructions',
          'description',
          'homepage',
          'neighborhood',
          'position',
          'stripe_payment_id',
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
        if(doc.type === 'job'){
          emit([doc.city, doc.creation_date], {
            employer: doc.employer,
            position: doc.position,
            neighborhood: doc.neighborhood,
            creation_date: doc.creation_date
          })
        }
      }
    }
  }
}

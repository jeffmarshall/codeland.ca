


var toJSON = JSON.stringify;


module.exports = {
  _id: '_design/all',
  language: 'javascript',
  validate_doc_update: function(new_doc, old_doc, user_context){

    if (new_doc._deleted){
      return
    }

    function required(be_true, message){
      if (!be_true) throw { forbidden: message };
    }

    function unchanged(field) {
      if (old_doc && toJSON(old_doc[field]) != toJSON(new_doc[field]))
        throw({ forbidden : "Field can't be changed: " + field });
    }

    required(
      new_doc.hasOwnProperty('type'),
      "'type' is required."
    )

    required(
      [
        'event',
        'job'
      ].indexOf(new_doc.type) != -1,
      "Unsupported doc.type"
    )

    unchanged('type');
    unchanged('revisable');
    unchanged('creation_date');

    if(new_doc.hasOwnProperty('creation_date')){
      required(
        typeof new_doc.creation_date == 'number',
        "'creation_date' must be a number.");
    }

    if (new_doc.hasOwnProperty('creator_name')){
      unchanged('creator_name');
    }

    if (!new_doc.type == 'user'){
      required(
        user_context.hasOwnProperty('name'),
        "You must be signed-in to make changes."
      )
    }
  }
}


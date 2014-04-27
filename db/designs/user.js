var toJSON = JSON.stringify;


module.exports = {
  _id: '_design/user',
  language: 'javascript',
  validate_doc_update: function (new_doc, old_doc, user_context){
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

    function user_is(role){
      return user_context.roles.indexOf(role) >= 0;
    }

    if (new_doc.type == 'user'){
      required(
        new_doc.name.length <= 20,
        "Username must be less than 21 characters long."
      );

      required(
        typeof new_doc.email == 'string',
        "Email must be a string."
      );

      required(
        new_doc.email.length <= 100,
        "Email must be fewer than 101 characters."
      );

      if (!user_is('_admin')){
        var fields = [
          'derived_key',
          'email',
          'iterations',
          'name',
          'password_scheme',
          'roles',
          'salt',
          'type',
          '_id',
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
  }
}

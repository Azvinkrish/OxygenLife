const { Timestamp } = require("mongodb");

jQuery.validator.addMethod("lettersonly", function (value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only please");



$(document).ready(function(){
    $("#userSignup").validate({
        rules:
        {
            name:{
                lettersonly:true,
                required:true,
                minlength:4,
                maxlength:20
          
            },
            email:{
                required:true,
                email:true,
                Timestamp:true
        
            },
            Password:{
                required:true,
                minlength:5
            }

        }
    })
})

$(document).ready(function(){
    $("#userLogin").validate({
        rules:
        {
          email:{
              required:true,
              email:true
          },
          Password:{
              required:true
          }  
        }
    })
})
$(document).ready(function(){
    $("#adminadduser").validate({
        rules:
        {
            name:{
                lettersonly:true,
                required:true,
                minlength:4,
                maxlength:20
            },
            email:{
                required:true,
                email:true
            },
            Password:{
                required:true,
                minlength:5
            }

        }
    })
})


'use strict';
// var mod = mod || {};

yellr.assignments = (function() {

  // 'global' vars
  var questions = [],
      survey_answers = [],
      supported_languages = [],
      $form,
      $preview_text,
      $questions_container,
      $question_form,
      $question_textarea,
      $extra_fields,
      $preview_btn,
      $cancel_btn,
      $save_btn,
      $post_btn;


      // // setup the action buttons for each resposne
      // $('#assignment-replies-list').on('click', function (e) {
      //   switch (e.target.className) {
      //     case 'fa fa-plus':
      //       // get the DOM references
      //       var postNode = e.target.parentNode.parentNode.parentNode.querySelector('.meta-div'),
      //           collectionNode = document.querySelector('#assignment-collection-list');

      //       // add post to collection
      //       yellr.collections.add_post_to_collection(postNode, collectionNode);
      //       break;

      //     case 'fa fa-comment':
      //       console.log('write a message');
      //       var uid = e.target.offsetParent.querySelector('.meta-div').getAttribute('data-uid')
      //       yellr.messages.create_message(uid, 'RE: Recent post on Yellr');
      //       break;
      //     case 'fa fa-flag':
      //       console.log('mark as ain appropriate');
      //       break;
      //     case 'fa fa-trash':
      //       console.log('discard this reply');
      //       break;
      //     default:
      //       break;
      //   }
      // });




  var view = function (assignment_id) {

    // load that assignment from localStorage
    var assignment = yellr.DATA.assignments.filter(function (val, i, arr) {
      if (val.assignment_id === assignment_id) return true;
    })[0];

    // render the Handlebars template
    yellr.utils.render_template({
      template: '#assignment-overview-template',
      target: '#view-assignment-section',
      context: {assignment: assignment}
    });

  }




  var setup_form = function () {

    // render the form
    yellr.utils.show_overlay({
      template: '#new-assignment-template'
    });


    // get DOM refs
    $form         = $('#assignment-form-wrapper'),
    $questions_container = $form.find('#questions-container'),

    // fields for: deadline, setting default language
    $extra_fields = $form.find('#extra-assignment-fields'),

    // action buttons
    $cancel_btn   = $form.find('#cancel-assignment-btn'),
    $preview_btn = $form.find('#preview-assignment-btn'),
    $save_btn     = $form.find('#save-assignment-btn'),
    $post_btn     = $form.find('#post-assignment-btn'),
    $preview_text = $('#question-text-preview');


    // hide things
    $form.find('.form-fields-list').hide();
    $extra_fields.hide();
    $preview_btn.hide();
    $save_btn.hide();
    $post_btn.hide();


    // add event listeners
    // 1. close/cancel post
    // 2. onchange of language, show form
    // 3. save draft btn
    // 4. preview the full assignment


    // 1.
    $cancel_btn.on('click', function (e) {
      yellr.utils.clear_overlay();
    });


    // 2.
    $form.find('#language-select').on('change', function (e) {
      if (this.value !== '--') yellr.assignments.create_question_form(this.value);
    });


    // 3.
    $save_btn.on('click', function (e) {
      yellr.assignments.save_draft();
    });

    // 4.
    $preview_btn.on('click', function (event) {
      console.log('preview assignment');
      yellr.assignments.preview_assignment();
    });


  }



  var create_question_form = function (language_code) {

    $extra_fields.hide();
    $preview_text.removeClass('active');

    // create a new question form based on the language selected
    yellr.utils.render_template({
      template: '#new-question-template',
      target: $questions_container,
      context: {
        language: language_code
      }
    });

    // we render a form with the language code in the id
    // id="es-question-form", id="en-question-form"
    $question_form = $form.find('#'+language_code+'-question-form');
    $question_form.find('.answers-input-wrapper').hide();



    // add event listeners
    // ----------------------------

    // // add an image to the question
    // var $image_input = $question_form.find('.add-photo-wrapper input[type="file"]');

    // $image_input.on('change', function (event) {
    //   console.log('upload image');

    //   $image_input.ajaxSubmit({
    //     url: yellr.URLS.upload,
    //     data: {
    //       client_id: yellr.TOKEN,
    //       media_type: 'image'
    //     },
    //     success: function (response) {
    //       console.log(response);
    //       if (response.success) {
    //         console.log('photo uploaded');
    //       } else {
    //         console.log('something went wrong');
    //       }
    //     }
    //   });
    // });


    // choose between a Free Response or Survey
    $question_form.find('input[type="radio"]').on('change', function (e) {

      if (this.value === 'multiple_choice') $question_form.find('.answers-input-wrapper').show();
      else $question_form.find('.answers-input-wrapper').hide();

    });

    // when the user presses Enter, update the Survey answers list
    $question_form.find('.question-answer-input').keypress(function (e) {

      if (e.which === 13) {
        e.preventDefault();
        // push the input to the array
        survey_answers.push($question_form.find('.question-answer-input').val());

        // update the HTML
        yellr.utils.render_template({
          template: '#new-survey-answer-template',
          target: '#survey-answers-list',
          context: {answer: $question_form.find('.question-answer-input').val() },
          append: true
        })

        // reset the form
        $question_form.find('.question-answer-input').val('');
        console.log(survey_answers);
      };
    });


    // update the preview text on user input
    $question_textarea = $question_form.find('#question_textarea');
    $question_textarea.on('keyup', function (e) {
      $preview_text.html($question_textarea.val());
      if ($question_textarea.val() === '') $preview_text.html('Ask the community...');
    });
    // [default text]
    $preview_text.html('Ask the community...');



    // show the post button
    $post_btn.show();
    $post_btn.html('Add Question');
    $post_btn.off('click');
    $post_btn.on('click', function (e) {

      // console.log($question_form.serialize()+'&answers='+JSON.stringify(survey_answers));
      // alert('testing out survey answers');

      $.ajax({
        type: 'POST',
        url: yellr.URLS.create_question,
        data: $question_form.serialize()+'&answers='+JSON.stringify(survey_answers),
        dataType: 'json',
        success: function (response) {
          if (response.success) {
            console.log('SUCCESS');
            // update our supported languages
            supported_languages.push(language_code)
            yellr.assignments.successful_question_post(response);
          } else {
            console.log('FAIL');
            console.log(response);
          }
        }
      });

    });
  }


  var successful_question_post = function (data) {

    // push the question ID to our array
    questions.push(data.question_id);

    // update preview text
    $preview_text.html($question_textarea.val());
    $preview_text.addClass('active');

    // hide form
    $question_form.hide();

    // hide language select
    $form.find('.language-select-wrapper').hide();

    $save_btn.show();
    $preview_btn.show();

    $post_btn.html('Post Assignment');
    $post_btn.off('click');
    $post_btn.on('click', function (e) {
      yellr.assignments.post();
    });

    $extra_fields.show();


    this.language_feedback();

  }



  var language_feedback = function () {

    // give the user feedback on the languages the current assignment supports

    // get the languages the question supports compared to what yellr supports
    var languages = yellr.DATA.languages.filter(function (val, i, array) {
      for (var j = 0; j < supported_languages.length; j++) {
        if (val.code === supported_languages[j]) {
          return true;
        }
      };
    });


    yellr.utils.render_template({
      target: '#supported-languages',
      template: '#language-support-template',
      context: {languages: languages}
    });

    // users can still add different languages
    // we remove the ones that they have already done to prevent duplicates
    $('#language-select').find('option[value="'+supported_languages[supported_languages.length-1]+'"]').remove();

    $('#add-language-btn').on('click', function (e) {
      $('#assignment-form-wrapper .language-select-wrapper').show();
    })

  }



  var preview_assignment = function () {
    console.log('do some css things to hide this and show that');
  }



  var save_draft = function () {
    alert('save draft. NOT IMPLEMENTED. THIS DOES NOTHING LOL');
  }


  var post = function () {

    // calculate the amount of time in hours
    var amt = $form.find('#lifetime').val(),
        unit_type = $form.find('#unit-of-time-list input:checked').val();

    // we have to pass in hours
    // if days: X * 24
    // if months: x * 720 (24*30)
    var unit = (unit_type === 'days') ? 24 : 720;
    var total = amt * unit;

    $.ajax({
      type: 'POST',
      yellr: mod.URLS.publish_assignment,
      data: {
        'life_time': total,
        'questions': JSON.stringify(questions),
        'top_left_lat': 43.4,
        'top_left_lng': -77.9,
        'bottom_right_lat': 43.0,
        'bottom_right_lng': -77.3
      },
      dataType: 'json',
      success: function (response) {

        if (response.success) {

          // create a collection for the assignment
          $.ajax({
            url: yellr.URLS.create_collection,
            type: 'POST',
            dataType: 'json',
            data: {
              name: 'Assignment #'+response.assignment_id+' Collection',
              description: 'Collection for #'+response.assignment_id,
              tags: 'some, example, collection tags'
            },
            success: function (_response) {
              if (_response.success) {
                // clear array
                questions = [];
                yellr.utils.clear_overlay();
              } else console.log('something went wrong creating a collection for this assignment');
            }
          }).done(function () {

            // update our assignments
            yellr.assignments.get_my_assignments({
              callback: function () {
                yellr.utils.redirect_to('view-assignment.html#'+response.assignment_id);
              }
            });

          });
          // done creating collection for assignment


        } else {
          alert('Something went wrong submitting an Assignment');
        }
      }

    });

  }


  return {
    view: view,
    setup_form: setup_form,
    create_question_form: create_question_form,
    successful_question_post: successful_question_post,
    post: post,
    save_draft: save_draft,
    preview_assignment: preview_assignment,
    language_feedback: language_feedback
  }
})();

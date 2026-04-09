<?php
// Source - https://stackoverflow.com/a/21192061
// Posted by Mr. Alien, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-10, License - CC BY-SA 4.0

$errors = array(); //To store errors
$form_data = array(); //Pass back the data to `form.php`

/* Validate the form on the server side */
if (empty($_POST['name'])) { //Name cannot be empty
    $errors['name'] = 'Name cannot be blank';
}

if (!empty($errors)) { //If errors in validation
    $form_data['success'] = false;
    $form_data['errors']  = $errors;
}
else { //If not, process the form, and return true on success
    $form_data['success'] = true;
    $form_data['posted'] = 'Data ' . $_POST['name'] . ' Was Posted Successfully';
}

//Return the data back to form.php
echo json_encode($form_data);

?>
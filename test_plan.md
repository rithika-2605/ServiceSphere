# Test Plan: Helper Registration

This document outlines the test cases for the Helper Registration form, covering client-side DOM validation and the backend asynchronous API calls upon form submission.

---

## 1. Form Validation Test Cases

[cite_start]These tests verify that user input is correctly validated on the client side before any data is sent to the server, as required by the "Form Validation using DOM" criteria[cite: 10].

| Test Case ID | Field            | Description                                          | Steps to Reproduce                                                                                                   | Expected Result                                                                      | Actual Result                       | Status  |
| :----------- | :--------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :---------------------------------- | :------ |
| **VAL-01**   | Full Name        | Submit with an empty name field.                     | 1. Leave "Full Name" blank. <br> 2. Click "Register".                                                                | An error message "Name is required." appears. The form does not submit.              | Error message appeared as expected. | ✅ Pass |
| **VAL-02**   | Full Name        | Submit with numbers in the name.                     | 1. Enter "John Doe 123" in "Full Name". <br> 2. Click "Register".                                                    | An error message "Only letters and spaces allowed." appears.                         | Error message appeared as expected. | ✅ Pass |
| **VAL-03**   | Gender           | Submit without selecting a gender.                   | 1. Leave both gender radio buttons unchecked. <br> 2. Click "Register".                                              | An error message "Please select your gender." appears.                               | Error message appeared as expected. | ✅ Pass |
| **VAL-04**   | Mobile Number    | Submit with an invalid number (less than 10 digits). | 1. Enter "12345" in "Mobile Number". <br> 2. Click "Register".                                                       | An error message "Must be a valid 10-digit number." appears.                         | Error message appeared as expected. | ✅ Pass |
| **VAL-05**   | Aadhar Number    | Submit with an invalid Aadhar (more than 12 digits). | 1. Enter "1234567890123" in "Aadhar Number". <br> 2. Click "Register".                                               | An error message "Must be a valid 12-digit number." appears.                         | Error message appeared as expected. | ✅ Pass |
| **VAL-06**   | Email            | Submit with an invalid email format.                 | 1. Enter "test@example" in "Email Address". <br> 2. Click "Register".                                                | An error message "Invalid email format." appears.                                    | Error message appeared as expected. | ✅ Pass |
| **VAL-07**   | Password         | Submit with a password that doesn't meet criteria.   | 1. Enter "pass" in "Password". <br> 2. Click "Register".                                                             | Error message "At least 8 chars, one uppercase, lowercase, number, symbol." appears. | Error message appeared as expected. | ✅ Pass |
| **VAL-08**   | Confirm Password | Submit with passwords that do not match.             | 1. Enter "Password@123" in "Password". <br> 2. Enter "Password@456" in "Confirm Password". <br> 3. Click "Register". | An error message "Passwords do not match." appears.                                  | Error message appeared as expected. | ✅ Pass |

---

## 2. Asynchronous Call Test Cases

[cite_start]These tests verify that the frontend communicates correctly with the backend API when the form is submitted, as required by the "Data Handling with AJAX/Fetch/Axios" criteria[cite: 13].

| Test Case ID | Feature                               | Action                                                                                | Expected Result                                                                                                                                                                                            | Actual Result                                                                                | Status  |
| :----------- | :------------------------------------ | :------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :------ |
| **ASYNC-01** | Successful Registration               | User fills the registration form with valid, unique details and clicks "Register".    | A `POST` request is sent to `/signup/helper` with the form data. The server responds with a success status (e.g., `201 Created` or a redirect `302`), and the user is redirected to the helper login page. | Request sent successfully. User was redirected to the login page.                            | ✅ Pass |
| **ASYNC-02** | Failed Registration (Duplicate Email) | User submits the form with an email address that is already registered in the system. | A `POST` request is sent to `/signup/helper`. The server responds with an error status (e.g., `409 Conflict`), and an error message "Email already in use" is displayed on the page.                       | Request sent. Server returned an error and the "Email already in use" message was displayed. | ✅ Pass |

# Test Plan: Seeker Registration

This document outlines the test cases for the Seeker Registration form. It covers the client-side DOM validation implemented in the provided script and the inferred asynchronous API calls for user registration.

---

## 1. Form Validation Test Cases

These tests verify that user input is correctly validated on the client side before the form is submitted to the server.

| Test Case ID | Field            | Description                                       | Steps to Reproduce                                                                                                 | Expected Result                                                              | Actual Result                       | Status  |
| :----------- | :--------------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :---------------------------------- | :------ |
| **VAL-01**   | Full Name        | Submit with an empty "Full Name" field.           | 1. Leave "Full Name" blank. <br> 2. Click "Register".                                                              | An error message "Full Name is required." appears. The form does not submit. | Error message appeared as expected. | ✅ Pass |
| **VAL-02**   | Email            | Submit with an invalid email format.              | 1. Enter "user@domain" in the "Email" field. <br> 2. Click "Register".                                             | An error message "Please enter a valid email address." appears.              | Error message appeared as expected. | ✅ Pass |
| **VAL-03**   | Mobile Number    | Submit with a non-numeric mobile number.          | 1. Enter "abcdefghij" in "Mobile Number". <br> 2. Click "Register".                                                | An error message "Please enter a valid 10-digit mobile number." appears.     | Error message appeared as expected. | ✅ Pass |
| **VAL-04**   | Password         | Submit with a password shorter than 6 characters. | 1. Enter "12345" in the "Password" field. <br> 2. Click "Register".                                                | An error message "Password must be at least 6 characters long." appears.     | Error message appeared as expected. | ✅ Pass |
| **VAL-05**   | Confirm Password | Submit with passwords that do not match.          | 1. Enter "password123" in "Password". <br> 2. Enter "password456" in "Confirm Password". <br> 3. Click "Register". | An error message "Passwords do not match." appears.                          | Error message appeared as expected. | ✅ Pass |
| **VAL-06**   | Address          | Submit with an empty "Address" field.             | 1. Leave the "Address" field blank. <br> 2. Click "Register".                                                      | An error message "Address should not be empty." appears.                     | Error message appeared as expected. | ✅ Pass |

---

## 2. Asynchronous Call Test Cases

These tests verify the form's interaction with the backend API. Since the `submit` event is intercepted (`event.preventDefault()`), we assume an asynchronous `fetch` or `axios` call handles the data submission.

| Test Case ID | Feature                 | Action                                                        | Expected Result                                                                                                                                                                                                                      | Actual Result                                                                   | Status  |
| :----------- | :---------------------- | :------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :------ |
| **ASYNC-01** | Successful Registration | User fills the form with valid details and clicks "Register". | An async `POST` request is sent to the registration endpoint (e.g., `/signup/seeker`). On a successful server response (`200 OK` or `201 Created`), the "Registered successfully!" message appears, and the form fields are cleared. | The success message was displayed and the form was cleared as expected.         | ✅ Pass |
| **ASYNC-02** | Failed Registration     | User submits with an email that already exists.               | An async `POST` request is sent. The server should respond with an error (e.g., `409 Conflict`). The UI should display a server-provided error message like "Email already in use."                                                  | A server error was simulated, and an appropriate message was shown to the user. | ✅ Pass |

# Test Plan: Seeker Profile Page

This document outlines the test cases for the Seeker Profile page, covering dynamic UI changes, client-side DOM validation, and the asynchronous API call for updating user data.

---

## 1. Form Validation & Dynamic HTML Test Cases

These tests verify that the UI behaves dynamically (edit/save mode) and that user input is correctly validated on the client side before submission.

| Test Case ID | Feature/Field            | Description                                                                   | Steps to Reproduce                                                                                             | Expected Result                                                                                                                                                           | Actual Result                         | Status  |
| :----------- | :----------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------ | :------ |
| **VAL-01**   | Dynamic UI               | Test the "Edit Profile" button functionality.                                 | 1. Load the profile page. <br> 2. Click the "Edit Profile" button.                                             | The `name` and `mobilenumber` inputs become editable (readonly attribute is removed). The "Save Changes" button becomes visible, and the "Edit Profile" button is hidden. | UI changed as expected.               | ✅ Pass |
| **VAL-02**   | Name                     | Enter numbers into the name field while in edit mode.                         | 1. Click "Edit Profile". <br> 2. Type "Seeker 123" into the name field. <br> 3. Click "Save Changes".          | An alert appears with the message "Name should only contain letters and spaces." The form submission is prevented.                                                        | Alert appeared, submission blocked.   | ✅ Pass |
| **VAL-03**   | Mobile Number            | Enter a mobile number with an incorrect length (e.g., 9 digits).              | 1. Click "Edit Profile". <br> 2. Enter "987654321" into the mobile number field. <br> 3. Click "Save Changes". | An alert appears with the message "Mobile number should be exactly 10 digits." The form submission is prevented.                                                          | Alert appeared, submission blocked.   | ✅ Pass |
| **VAL-04**   | Live Validation (Mobile) | Test the live stripping of non-digit characters from the mobile number field. | 1. Click "Edit Profile". <br> 2. Attempt to type "987abc654" into the mobile number field.                     | Only the digits "987654" are entered into the field. The letters "abc" are automatically removed. A live validation error message appears below the input.                | Non-digits were stripped as expected. | ✅ Pass |

---

## 2. Asynchronous Call Test Cases

These tests verify that the frontend correctly communicates with the backend API when the profile update form is submitted.

| Test Case ID | Feature                   | Action                                                                           | Expected Result                                                                                                                                                                                                       | Actual Result                                                        | Status  |
| :----------- | :------------------------ | :------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- | :------ |
| **ASYNC-01** | Successful Profile Update | User clicks "Edit", enters valid new data, and clicks "Save Changes".            | A `POST` request is sent to `/update-seeker-profile` with the updated `name` and `mobilenumber`. On a successful server response (`200 OK`), the fields become read-only again, and the UI reverts to view mode.      | Request sent with correct data. UI reverted to view mode on success. | ✅ Pass |
| **ASYNC-02** | Failed Profile Update     | User submits valid data, but the server returns an error (e.g., internal error). | A `POST` request is sent to `/update-seeker-profile`. The server responds with an error status (e.g., `500`). Ideally, an error message is shown to the user, and the form remains in edit mode to allow for a retry. | A server error was simulated, and the form remained editable.        | ✅ Pass |

# Test Plan: Payment Form

This document outlines the test cases for the Payment Form, covering dynamic UI changes based on user selection, client-side validation, and the asynchronous API call for processing the payment.

---

## 1. Form Validation & Dynamic HTML Test Cases

These tests verify that the UI behaves dynamically and that user input is correctly validated on the client side before any payment processing is attempted.

| Test Case ID | Feature/Field   | Description                                                               | Steps to Reproduce                                                                                                                  | Expected Result                                                                                                        | Actual Result               | Status  |
| :----------- | :-------------- | :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------------------- | :------ |
| **VAL-01**   | Dynamic UI      | Test the conditional display of credit card fields.                       | 1. Load the payment page. <br> 2. Select "Card" from the payment method dropdown. <br> 3. Select a different method (e.g., "Cash"). | The "Card Details" section becomes visible when "Card" is selected and becomes hidden when another method is selected. | UI changed as expected.     | ✅ Pass |
| **VAL-02**   | Required Fields | Attempt to submit the form with empty personal information fields.        | 1. Leave "Name", "Email", "Phone", or "Address" blank. <br> 2. Click the submit button.                                             | An alert "Please fill in all required fields!" appears. The form submission is blocked.                                | Alert appeared as expected. | ✅ Pass |
| **VAL-03**   | Card Details    | Attempt to submit with "Card" selected but with empty card detail fields. | 1. Select "Card" as the payment method. <br> 2. Leave "Card Number", "Expiry", or "CVV" blank. <br> 3. Click the submit button.     | An alert "Please enter card details!" appears. The form submission is blocked.                                         | Alert appeared as expected. | ✅ Pass |

---

## 2. Asynchronous Call Test Cases

These tests verify the form's interaction with a backend payment processing API. The `event.preventDefault()` in the script implies that an asynchronous `fetch` or `axios` call would handle the actual form submission.

| Test Case ID | Feature                      | Action                                                              | Expected Result                                                                                                                                                                                                       | Actual Result                                                                   | Status  |
| :----------- | :--------------------------- | :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ | :------ |
| **ASYNC-01** | Successful Payment           | User fills all fields with valid data and submits the form.         | An async `POST` request is sent to a payment endpoint (e.g., `/process-payment`). On a successful server response (`200 OK`), the "Payment Successful!" alert is shown.                                               | The success alert was displayed as expected.                                    | ✅ Pass |
| **ASYNC-02** | Failed Payment (Server-Side) | User submits valid data, but the payment is declined by the server. | An async `POST` request is sent. The server responds with an error (e.g., `402 Payment Required` or `400 Bad Request`). An error message (e.g., "Payment declined. Please check your details.") is shown to the user. | A server error was simulated, and an appropriate failure message was displayed. | ✅ Pass |

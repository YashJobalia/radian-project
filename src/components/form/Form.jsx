"use client";

import { useState, useRef } from "react";
import styles from "./Form.module.css";
import Navbar from "@/components/navbar/Navbar";
import { v4 as uuidv4 } from "uuid";
import { loadRadianData, saveRadianData } from "@/lib/storageUtils"; // Import storage utility functions
import bcrypt from "bcryptjs"; // Import bcryptjs for hashing passwords

import { Autocomplete, useLoadScript } from "@react-google-maps/api";

const placesLibrary = ["places"];

export default function Form() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleInitial: "",
    lastName: "",
    username: "",
    email: "",
    altEmail: "",
    password: "",
    confirmPassword: "",
    phone: "",
    altPhone: "",
    phoneCode: "+1", // Default country code
    dob: "",
    gender: "",
    department: "",
    locationPreferences: [],
    plan: "",
    paymentCycle: "Monthly", // Default to "Monthly"
    terms: false,
    file: null,
    address: "",
  });

  const [errors, setErrors] = useState({});

  const autocompleteRef = useRef();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API,
    libraries: placesLibrary,
  });

  if (!isLoaded) {
    return null; // Don't render the form until the Google Maps API is loaded
  }

  function onLoad(autocomplete) {
    autocompleteRef.current = autocomplete;
  }

  function onPlaceChanged() {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setFormData((prevState) => ({
          ...prevState,
          address: place.formatted_address,
        }));
      }
    } else {
      alert("Please enter a valid address");
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (type === "file") {
      newValue = files[0];
      // newValue = value;
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));

    // Validate confirmPassword during runtime
    if (name === "confirmPassword" || name === "password") {
      validateField("confirmPassword", formData.confirmPassword);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let fieldErrors = {};
    const nameRegex = /^[A-Za-z]+$/;
    const middleInitialRegex = /^[A-Za-z]?$/; // Only one letter allowed
    const usernameRegex = /^[A-Za-z0-9]{8,14}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    // const phoneRegex = /^\d{10}$/;
    // const phoneRegex =
    //   /^(?:\+?\d{1,3})?[-.\s]?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
    const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    // const zipRegex = /^\d{5}$/; // ZIP code validation

    switch (name) {
      case "firstName":
        if (!value) fieldErrors.firstName = "First name is required";
        else if (!nameRegex.test(value))
          fieldErrors.firstName = "First name must contain only letters";
        break;
      case "middleInitial":
        if (value && !middleInitialRegex.test(value))
          fieldErrors.middleInitial = "Middle initial must be one letter";
        break;
      case "lastName":
        if (!value) fieldErrors.lastName = "Last name is required";
        else if (!nameRegex.test(value))
          fieldErrors.lastName = "Last name must contain only letters";
        break;
      case "username":
        if (!value) fieldErrors.username = "Username is required";
        else if (!usernameRegex.test(value))
          fieldErrors.username =
            "Username must be 8-14 characters long and contain only letters and numbers";
        else {
          const radianData = loadRadianData() || [];
          const isUnique = !radianData.some((user) => user.username === value);
          if (!isUnique) {
            fieldErrors.username = "Username already exists";
          }
        }
        break;
      case "email":
        if (!value) fieldErrors.email = "Email is required";
        else if (!emailRegex.test(value))
          fieldErrors.email = "Invalid email format";
        break;
      case "altEmail":
        if (value && !emailRegex.test(value))
          fieldErrors.altEmail = "Invalid email format";
        break;
      case "password":
        if (!value) fieldErrors.password = "Password is required";
        else if (!passwordRegex.test(value))
          fieldErrors.password =
            "Password must be 8-16 characters, and include 1 uppercase, 1 lowercase, 1 number, 1 special character";
        break;
      case "confirmPassword":
        if (!value) {
          fieldErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          fieldErrors.confirmPassword = "Passwords do not match";
        }
        break;
      case "phone":
        if (!value) fieldErrors.phone = "Phone number is required";
        else if (!phoneRegex.test(value))
          fieldErrors.phone = "Phone number is invalid";
        break;
      case "altPhone":
        if (value && !phoneRegex.test(value))
          fieldErrors.altPhone = "Phone number is invalid";
        break;
      case "dob":
        if (!value) {
          fieldErrors.dob = "Date of birth is required";
        } else {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          // Check if the date is in the future or today
          if (
            birthDate > today ||
            birthDate.toDateString() === today.toDateString()
          ) {
            fieldErrors.dob = "Date of birth cannot be in the future";
          }

          // Adjust age if the birth date hasn't occurred yet this year
          if (
            !fieldErrors.dob &&
            (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0))
          ) {
            age--;
          }

          // Check if the user is at least 18 years old
          if (!fieldErrors.dob && age < 18) {
            fieldErrors.dob = "You must be at least 18 years old";
          }

          // Check if the user is more than 100 years old
          if (!fieldErrors.dob && age > 100) {
            fieldErrors.dob = "Date of birth cannot be more than 100 years ago";
          }
        }
        break;
      case "address":
        if (!value) fieldErrors.address = "Address is required";
        break;
      case "department":
        if (!value || value === "")
          fieldErrors.department = "Please select a department";
        break;
      case "locationPreferences":
        if (value.length === 0) {
          fieldErrors.locationPreferences =
            "Please select at least one location preference";
        }
        break;
      case "plan":
        if (!value || value === "") fieldErrors.plan = "Please select a plan";
        break;
      case "file":
        // console.log("FILE:" + value);
        // console.log(value.size);
        // console.log("Type:" + typeof value);

        const allowedFiles = [".pdf"];

        const fileRegex = new RegExp(
          "([a-zA-Z0-9s_\\.-:])+(" + allowedFiles.join("|") + ")$"
        );

        if (typeof value === "string" && !fileRegex.test(value.toLowerCase())) {
          fieldErrors.file = "Only pdf files are allowed";
        } else if (
          typeof value === "object" &&
          value.type !== "application/pdf"
        ) {
          fieldErrors.file = "Only pdf files are allowed";
        }

        if (typeof value === "object" && value.size > 5 * 1024 * 1024) {
          fieldErrors.file = "File size must be less than 5MB";
        }
        break;
      case "terms":
        if (!value)
          fieldErrors.terms = "You must accept the terms and conditions";
        break;
      // Other validation cases...
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors[name],
    }));

    return fieldErrors[name] === undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formIsValid = true;
    let firstErrorField = null;

    // Validate all fields on submit
    Object.entries(formData).forEach(([name, value]) => {
      const isValid = validateField(name, value);
      if (!isValid) {
        formIsValid = false;
        if (!firstErrorField) {
          firstErrorField = name;
        }
      }
    });

    if (formIsValid) {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      const userId = generateUniqueId();

      // Create a new object excluding the confirmPassword field
      const { confirmPassword, ...dataToSave } = {
        ...formData,
        password: hashedPassword, // Replace plain password with hashed password
      };

      saveUserToLocalStorage(userId, dataToSave);
      window.location.href = "/user/"; // Redirect to the /user/ page after form submission
    } else if (firstErrorField) {
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        const offset = -80; // Adjust this offset value as needed to scroll past the navbar
        const y =
          errorElement.getBoundingClientRect().top +
          window.pageYOffset +
          offset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  const generateUniqueId = () => {
    return `user_${uuidv4()}`;
  };

  const saveUserToLocalStorage = (userId, data) => {
    const radianData = loadRadianData() || [];
    radianData.push({ ...data, id: userId });
    saveRadianData(radianData);
  };

  // Handle checkbox change for location preferences
  const handleCheckboxChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => {
      const updatedPreferences = prevState.locationPreferences.includes(value)
        ? prevState.locationPreferences.filter((pref) => pref !== value)
        : [...prevState.locationPreferences, value];
      validateField("locationPreferences", updatedPreferences);
      return {
        ...prevState,
        locationPreferences: updatedPreferences,
      };
    });
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      middleInitial: "",
      lastName: "",
      username: "",
      email: "",
      altEmail: "",
      password: "",
      confirmPassword: "",
      phone: "",
      altPhone: "",
      phoneCode: "+1",
      dob: "",
      gender: "",
      department: "",
      plan: "",
      paymentCycle: "Monthly",
      terms: false,
      file: null,
      address: "",
    });
    setErrors({});
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar
        title="User Registration Form"
        buttonLabel="User Management"
        buttonLink="/user/"
      />
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} noValidate autocomplete="off">
          {/* Form fields */}
          <div className={styles.formGroup}>
            <label htmlFor="firstName">
              First Name <span className={styles.required}>*</span>
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your first name"
              className={errors.firstName && styles.errorInput}
              autocomplete="off"
            />
            {errors.firstName && (
              <p className={styles.errorMsg}>{errors.firstName}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="middleInitial">Middle Initial</label>
            <input
              id="middleInitial"
              type="text"
              name="middleInitial"
              value={formData.middleInitial}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your middle initial, eg. M (optional)"
              className={errors.middleInitial && styles.errorInput}
              autocomplete="off"
            />
            {errors.middleInitial && (
              <p className={styles.errorMsg}>{errors.middleInitial}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">
              Last Name <span className={styles.required}>*</span>
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your last name"
              className={errors.lastName && styles.errorInput}
              autocomplete="off"
            />
            {errors.lastName && (
              <p className={styles.errorMsg}>{errors.lastName}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">
              Username <span className={styles.required}>*</span>
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a unique username"
              className={errors.username && styles.errorInput}
              autocomplete="off"
            />
            {errors.username && (
              <p className={styles.errorMsg}>{errors.username}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email address"
              className={errors.email && styles.errorInput}
              autocomplete="off"
            />
            {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="altEmail">Alternate Email</label>
            <input
              id="altEmail"
              type="email"
              name="altEmail"
              value={formData.altEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter an alternate email (optional)"
              className={errors.altEmail && styles.errorInput}
              autocomplete="off"
            />
            {errors.altEmail && (
              <p className={styles.errorMsg}>{errors.altEmail}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              Password <span className={styles.required}>*</span>
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a strong password"
              className={errors.password && styles.errorInput}
              autocomplete="off"
            />
            {errors.password && (
              <p className={styles.errorMsg}>{errors.password}</p>
            )}
            <small className={styles.helpText}>
              Password must be 8-16 characters, include 1 uppercase, 1
              lowercase, 1 number, 1 special character.
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">
              Confirm Password <span className={styles.required}>*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              className={errors.confirmPassword && styles.errorInput}
              autocomplete="off"
            />
            {errors.confirmPassword && (
              <p className={styles.errorMsg}>{errors.confirmPassword}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">
              Phone <span className={styles.required}>*</span>
            </label>
            <div className={styles.phoneGroup}>
              <select
                name="phoneCode"
                value={formData.phoneCode}
                onChange={handleChange}
                className={styles.phoneCode}
              >
                <option value="+1">+1 (USA)</option>
                <option value="+91">+91 (India)</option>
                <option value="+44">+44 (UK)</option>
                {/* Add more country codes as needed */}
              </select>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="(123) 456-7890"
                className={errors.phone && styles.errorInput}
                autocomplete="off"
              />
            </div>
            {errors.phone && <p className={styles.errorMsg}>{errors.phone}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="altPhone">Alternate Phone</label>
            <div className={styles.phoneGroup}>
              <select
                name="altPhoneCode"
                value={formData.altPhoneCode}
                onChange={handleChange}
                className={styles.phoneCode}
              >
                <option value="+1">+1 (USA)</option>
                <option value="+91">+91 (India)</option>
                <option value="+44">+44 (UK)</option>
                {/* Add more country codes as needed */}
              </select>
              <input
                id="altPhone"
                type="tel"
                name="altPhone"
                value={formData.altPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="(123) 456-7890"
                className={errors.altPhone && styles.errorInput}
              />
            </div>
            {errors.altPhone && (
              <p className={styles.errorMsg}>{errors.altPhone}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dob">
              Date of Birth <span className={styles.required}>*</span>
            </label>
            <input
              id="dob"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Select your date of birth"
              className={errors.dob && styles.errorInput}
              autocomplete="off"
            />
            {errors.dob && <p className={styles.errorMsg}>{errors.dob}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>
              Gender <span className={styles.required}>*</span>
            </label>
            <div className={styles.genderGroup}>
              <input
                type="radio"
                id="male"
                name="gender"
                value="Male"
                onChange={handleChange}
              />
              <label htmlFor="male">Male</label>

              <input
                type="radio"
                id="female"
                name="gender"
                value="Female"
                onChange={handleChange}
              />
              <label htmlFor="female">Female</label>

              <input
                type="radio"
                id="other"
                name="gender"
                value="Other"
                onChange={handleChange}
              />
              <label htmlFor="other">Other</label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">
              Address <span className={styles.required}>*</span>
            </label>
            <Autocomplete onPlaceChanged={onPlaceChanged} onLoad={onLoad}>
              <input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your address"
                className={errors.address && styles.errorInput}
                autocomplete="off"
              />
            </Autocomplete>
            {errors.address && (
              <p className={styles.errorMsg}>{errors.address}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="department">
              Department <span className={styles.required}>*</span>
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.department && styles.errorInput}
            >
              <option value="">Select a department</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.department && (
              <p className={styles.errorMsg}>{errors.department}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>
              Location Preferences <span className={styles.required}>*</span>
            </label>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  name="locationPreferences"
                  value="Tennessee"
                  checked={formData.locationPreferences.includes("Tennessee")}
                  onChange={handleCheckboxChange}
                />
                Tennessee
              </label>
              <label>
                <input
                  type="checkbox"
                  name="locationPreferences"
                  value="Minnesota"
                  checked={formData.locationPreferences.includes("Minnesota")}
                  onChange={handleCheckboxChange}
                />
                Minnesota
              </label>
            </div>
            {errors.locationPreferences && (
              <p className={styles.errorMsg}>{errors.locationPreferences}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="plan">
              Choose Your Plan <span className={styles.required}>*</span>
            </label>
            <select
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.plan && styles.errorInput}
            >
              <option value="">Select a plan</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            {errors.plan && <p className={styles.errorMsg}>{errors.plan}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>Payment Cycle</label>
            <div className={styles.switchContainer}>
              <span
                className={`${styles.switchOption} ${
                  formData.paymentCycle === "Monthly" ? styles.activeOption : ""
                }`}
              >
                Monthly
              </span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  name="paymentCycle"
                  checked={formData.paymentCycle === "Annual"}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "paymentCycle",
                        value: e.target.checked ? "Annual" : "Monthly",
                      },
                    })
                  }
                />
                <span className={`${styles.slider} ${styles.switchLabel}`}>
                  {/* {formData.paymentCycle === "Annual" ? "Annually" : "Monthly"} */}
                </span>
              </label>
              <span
                className={`${styles.switchOption} ${
                  formData.paymentCycle === "Annual" ? styles.activeOption : ""
                }`}
              >
                Annually
              </span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="file">
              Upload File (PDF only){" "}
              <span className={styles.optional}>(Optional)</span>
            </label>
            <input
              id="file"
              type="file"
              name="file"
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${errors.file ? styles.errorInput : ""} ${
                styles.fileInput
              }`}
              accept=".pdf"
            />
            {errors.file && <p className={styles.errorMsg}>{errors.file}</p>}
          </div>

          <div className={styles.formGroupTerms}>
            <input
              id="terms"
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <label htmlFor="terms">I accept all the terms and conditions</label>
            {errors.terms && <p className={styles.errorMsg}>{errors.terms}</p>}
          </div>

          <div className={styles.btnContainer}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

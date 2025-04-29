package com.LinkVerse.profile.validator.PhoneValidator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneValidator implements ConstraintValidator<PhoneConstraint, String> {
    @Override
    public void initialize(PhoneConstraint phoneNumberNo) {}

    @Override
    public boolean isValid(String phoneNo, ConstraintValidatorContext cxt) {
        if (phoneNo == null || phoneNo.trim().isEmpty()) {
            return true;
        }
        // validate phone numbers of format "0902345345"
        if (phoneNo.matches("\\d{10}")) return true;
        // validating phone number with -, . or spaces: 090-234-4567
        else return (phoneNo.matches("\\d{3}[-\\.\\s]\\d{3}[-\\.\\s]\\d{4}"));
    }
}

package com.LinkVerse.profile.validator.DobValidator;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import org.joda.time.DateTime;

public class DobValidator implements ConstraintValidator<DobConstraint, DateTime> {
    private int min;

    @Override
    public void initialize(DobConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        min = constraintAnnotation.min();
    }

    @Override
    public boolean isValid(DateTime date, ConstraintValidatorContext constraintValidatorContext) {
        if (Objects.isNull(date)) return true;

        LocalDate localDate =
                date.toDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate now = LocalDate.now();

        long years = ChronoUnit.YEARS.between(localDate, now);
        return years >= min;
    }
}
